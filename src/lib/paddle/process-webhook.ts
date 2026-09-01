import {
  EventName,
  type EventEntity,
  type SubscriptionCreatedEvent,
  type SubscriptionUpdatedEvent,
  type SubscriptionCanceledEvent,
  type SubscriptionActivatedEvent,
  type SubscriptionPastDueEvent,
  type SubscriptionPausedEvent,
  type SubscriptionResumedEvent,
  type CustomerCreatedEvent,
  type CustomerUpdatedEvent,
  type TransactionCompletedEvent,
} from '@paddle/paddle-node-sdk';
import { getPaddleInstance } from './get-paddle-instance';
import { db } from '@/server/db';
import { customers, subscriptions, workspaces, billingWebhookEvents } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { resolvePlanTier } from './access';

type SubscriptionEvent =
  | SubscriptionCreatedEvent
  | SubscriptionUpdatedEvent
  | SubscriptionCanceledEvent
  | SubscriptionActivatedEvent
  | SubscriptionPastDueEvent
  | SubscriptionPausedEvent
  | SubscriptionResumedEvent;

/**
 * Verifies and unmarshals the incoming raw webhook request using Paddle SDK.
 * Throws an error if signature verification fails.
 */
export async function unmarshalWebhook(
  rawBody: string,
  signatureHeader: string | null | undefined
): Promise<EventEntity> {
  const secretKey =
    process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET ||
    process.env.PADDLE_WEBHOOK_SECRET;

  if (!secretKey) {
    throw new Error('PADDLE_WEBHOOK_SECRET is not configured in environment variables.');
  }

  if (!signatureHeader) {
    throw new Error('Missing Paddle-Signature header.');
  }

  const paddle = getPaddleInstance();
  const event = await paddle.webhooks.unmarshal(rawBody, secretKey, signatureHeader);

  if (!event) {
    throw new Error('Paddle webhook signature verification failed.');
  }

  return event;
}

/**
 * Routes verified webhook events to dedicated idempotent handlers.
 */
export async function processWebhookEvent(event: EventEntity) {
  // 1. Record webhook event in dedup log
  try {
    const existing = await db
      .select({ id: billingWebhookEvents.id })
      .from(billingWebhookEvents)
      .where(eq(billingWebhookEvents.eventId, event.eventId))
      .limit(1);

    if (!existing.length) {
      await db.insert(billingWebhookEvents).values({
        provider: 'paddle',
        eventId: event.eventId,
        eventType: event.eventType,
        status: 'processing',
        payload: event as any,
      });
    }
  } catch (err) {
    console.warn('Could not record webhook event audit log:', err);
  }

  // 2. Dispatch to typed idempotent handler
  switch (event.eventType) {
    case EventName.CustomerCreated:
    case EventName.CustomerUpdated:
      await handleCustomerEvent(event as CustomerCreatedEvent | CustomerUpdatedEvent);
      break;

    case EventName.SubscriptionCreated:
    case EventName.SubscriptionUpdated:
    case EventName.SubscriptionCanceled:
    case EventName.SubscriptionActivated:
    case EventName.SubscriptionPastDue:
    case EventName.SubscriptionPaused:
    case EventName.SubscriptionResumed:
      await handleSubscriptionEvent(event as SubscriptionEvent);
      break;

    case EventName.TransactionCompleted:
      await handleTransactionCompleted(event as TransactionCompletedEvent);
      break;

    default:
      console.log(`Safely ignoring unhandled Paddle event: ${event.eventType}`);
      break;
  }

  // 3. Mark processed
  try {
    await db
      .update(billingWebhookEvents)
      .set({ status: 'processed' })
      .where(eq(billingWebhookEvents.eventId, event.eventId));
  } catch {}
}

/**
 * Idempotent upsert for Paddle customers
 */
async function handleCustomerEvent(
  event: CustomerCreatedEvent | CustomerUpdatedEvent
) {
  const customerData = event.data;
  const customerId = customerData.id;
  const email = customerData.email.toLowerCase().trim();

  await db
    .insert(customers)
    .values({
      customerId,
      email,
      createdAt: new Date(customerData.createdAt || Date.now()),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: customers.customerId,
      set: {
        email,
        updatedAt: new Date(),
      },
    });

  console.log(`✓ Mirrored customer ${customerId} (${email})`);
}

/**
 * Idempotent upsert for Paddle subscriptions and workspace plan provisioning
 */
async function handleSubscriptionEvent(event: SubscriptionEvent) {
  const sub = event.data;
  const subscriptionId = sub.id;
  const customerId = sub.customerId;
  const status = sub.status;

  const firstItem = sub.items?.[0];
  const priceId = firstItem?.price?.id || '';
  const productId = firstItem?.price?.productId || '';

  const scheduledChangeAction = sub.scheduledChange?.action || null;
  const scheduledChangeAt = sub.scheduledChange?.effectiveAt
    ? new Date(sub.scheduledChange.effectiveAt)
    : null;

  // 1. Ensure customer record exists if not already present
  const existingCustomer = await db
    .select()
    .from(customers)
    .where(eq(customers.customerId, customerId))
    .limit(1);

  if (!existingCustomer.length) {
    // Look up customer email from Paddle API or fallback
    try {
      const paddle = getPaddleInstance();
      const fetchedCustomer = await paddle.customers.get(customerId);
      if (fetchedCustomer?.email) {
        await db.insert(customers).values({
          customerId,
          email: fetchedCustomer.email.toLowerCase().trim(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } catch (err) {
      console.warn(`Could not fetch customer ${customerId} during subscription upsert:`, err);
    }
  }

  // 2. Idempotent upsert into subscriptions table
  await db
    .insert(subscriptions)
    .values({
      subscriptionId,
      customerId,
      status,
      priceId,
      productId,
      scheduledChangeAction,
      scheduledChangeAt,
      createdAt: new Date(sub.createdAt || Date.now()),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: subscriptions.subscriptionId,
      set: {
        status,
        priceId,
        productId,
        scheduledChangeAction,
        scheduledChangeAt,
        updatedAt: new Date(),
      },
    });

  console.log(`✓ Mirrored subscription ${subscriptionId} (status: ${status})`);

  // 3. Provision workspace if custom_data contains workspaceId or by matching customer email
  const customData = (sub.customData || {}) as Record<string, any>;
  let targetWorkspaceId = customData.workspaceId;
  const currentPeriodEnd = sub.currentBillingPeriod?.endsAt
    ? new Date(sub.currentBillingPeriod.endsAt)
    : null;

  const planTier = resolvePlanTier(priceId, productId);
  const activePlanTier = status === 'active' || status === 'trialing' ? planTier : 'free';

  if (!targetWorkspaceId) {
    // Look up customer email to find user's workspace
    const [custRow] = await db
      .select({ email: customers.email })
      .from(customers)
      .where(eq(customers.customerId, customerId))
      .limit(1);

    if (custRow?.email) {
      const { teamMembers, users } = await import('@/server/db/schema');
      const [userMatch] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, custRow.email))
        .limit(1);

      if (userMatch?.id) {
        const [tmMatch] = await db
          .select({ workspaceId: teamMembers.workspaceId })
          .from(teamMembers)
          .where(eq(teamMembers.userId, userMatch.id))
          .limit(1);

        if (tmMatch?.workspaceId) {
          targetWorkspaceId = tmMatch.workspaceId;
        }
      }
    }
  }

  if (targetWorkspaceId) {
    await db
      .update(workspaces)
      .set({
        planTier: activePlanTier,
        subscriptionStatus: status,
        paymentProvider: 'paddle',
        subscriptionId,
        customerId,
        currentPeriodEnd,
        updatedAt: new Date(),
      })
      .where(eq(workspaces.id, targetWorkspaceId));

    console.log(`✓ Updated workspace ${targetWorkspaceId} plan to ${activePlanTier}`);
  }
}

/**
 * Handle completed transaction events
 */
async function handleTransactionCompleted(event: TransactionCompletedEvent) {
  const txn = event.data;
  console.log(`✓ Processed transaction.completed (${txn.id}) for customer ${txn.customerId}`);
}
