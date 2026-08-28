import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/server/db";
import { workspaces, billingWebhookEvents } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { getPaymentProvider } from "@/lib/payments";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const provider = getPaymentProvider();

    // Verify signature & parse normalized event
    const event = await provider.parseWebhook(rawBody, req.headers);

    // 1. Idempotency Check: Prevent duplicate processing on webhook retries
    const existingEvent = await db
      .select({ id: billingWebhookEvents.id })
      .from(billingWebhookEvents)
      .where(eq(billingWebhookEvents.eventId, event.eventId))
      .limit(1);

    if (existingEvent.length > 0) {
      return NextResponse.json(
        { received: true, message: "Event already processed" },
        { status: 200 }
      );
    }

    // 2. Record event in billing_webhook_events
    await db.insert(billingWebhookEvents).values({
      provider: event.provider,
      eventId: event.eventId,
      eventType: event.eventType,
      status: "processed",
      payload: event.rawPayload,
    });

    // 3. Process subscription state changes
    if (
      event.eventType === "subscription.created" ||
      event.eventType === "subscription.updated" ||
      event.eventType === "payment.succeeded"
    ) {
      if (event.workspaceId) {
        await db
          .update(workspaces)
          .set({
            planTier: event.planTier || "pro",
            subscriptionStatus: event.status || "active",
            paymentProvider: event.provider,
            subscriptionId: event.subscriptionId || undefined,
            customerId: event.customerId || undefined,
            currentPeriodEnd: event.currentPeriodEnd || undefined,
            updatedAt: new Date(),
          })
          .where(eq(workspaces.id, event.workspaceId));
      } else if (event.subscriptionId) {
        // Fallback match by subscriptionId if workspaceId wasn't in metadata
        await db
          .update(workspaces)
          .set({
            planTier: event.planTier || "pro",
            subscriptionStatus: event.status || "active",
            currentPeriodEnd: event.currentPeriodEnd || undefined,
            updatedAt: new Date(),
          })
          .where(eq(workspaces.subscriptionId, event.subscriptionId));
      }
    } else if (event.eventType === "subscription.canceled") {
      if (event.workspaceId) {
        await db
          .update(workspaces)
          .set({
            planTier: "free",
            subscriptionStatus: "canceled",
            updatedAt: new Date(),
          })
          .where(eq(workspaces.id, event.workspaceId));
      } else if (event.subscriptionId) {
        await db
          .update(workspaces)
          .set({
            planTier: "free",
            subscriptionStatus: "canceled",
            updatedAt: new Date(),
          })
          .where(eq(workspaces.subscriptionId, event.subscriptionId));
      }
    }

    return NextResponse.json({ received: true, eventId: event.eventId }, { status: 200 });
  } catch (error: any) {
    console.error("[Billing Webhook Error]:", error);
    return NextResponse.json(
      { error: "Webhook processing error" },
      { status: 400 }
    );
  }
}
