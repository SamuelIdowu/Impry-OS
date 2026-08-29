import { NextRequest, NextResponse } from 'next/server';
import { unmarshalWebhook, processWebhookEvent } from '@/lib/paddle/process-webhook';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const signature =
    request.headers.get('paddle-signature') ||
    request.headers.get('Paddle-Signature');

  if (!signature) {
    console.error('Webhook rejected: Missing Paddle-Signature header.');
    return NextResponse.json(
      { error: 'Missing paddle-signature header' },
      { status: 400 }
    );
  }

  // 1. Read RAW body as text (Do NOT json.parse before unmarshal)
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch (err: any) {
    console.error('Failed to read request raw body:', err);
    return NextResponse.json(
      { error: 'Could not read request body' },
      { status: 400 }
    );
  }

  // 2. Unmarshal and verify signature using Paddle SDK
  let event;
  try {
    event = await unmarshalWebhook(rawBody, signature);
  } catch (err: any) {
    console.error('Paddle webhook verification failed:', err.message);
    // Non-2xx tells Paddle delivery failed and triggers retry
    return NextResponse.json(
      { error: 'Invalid webhook signature', details: err.message },
      { status: 401 }
    );
  }

  // 3. Process event with idempotent handler
  try {
    await processWebhookEvent(event);
    return NextResponse.json({ received: true, eventId: event.eventId });
  } catch (err: any) {
    console.error(`Error processing webhook event (${event.eventId}):`, err);
    // Non-2xx so Paddle will retry
    return NextResponse.json(
      { error: 'Internal processing error', details: err.message },
      { status: 500 }
    );
  }
}
