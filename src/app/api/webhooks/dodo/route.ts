import { NextRequest, NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';
import dbConnect from '@/lib/auth/mongodb';
import User from '@/lib/auth/User';

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        const webhookId = req.headers.get('webhook-id') || '';
        const webhookSignature = req.headers.get('webhook-signature') || '';
        const webhookTimestamp = req.headers.get('webhook-timestamp') || '';

        const client = new DodoPayments({
            bearerToken: process.env.DODO_PAYMENTS_API_KEY,
            environment: process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode' ? 'live_mode' : 'test_mode',
            webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY,
        });

        let event: any;
        if (process.env.DODO_PAYMENTS_WEBHOOK_KEY) {
            event = client.webhooks.unwrap(rawBody, {
                headers: {
                    'webhook-id': webhookId,
                    'webhook-signature': webhookSignature,
                    'webhook-timestamp': webhookTimestamp,
                },
            });
        } else {
            // Fallback for development/testing when webhook key is not set yet
            event = JSON.parse(rawBody);
        }

        console.log(`[Dodo Webhook] Event received: ${event.type}`);

        await dbConnect();

        const customerEmail = event.data?.customer?.email;

        if (event.type === 'subscription.active' || event.type === 'payment.succeeded') {
            if (customerEmail) {
                const user = await User.findOne({ email: customerEmail });
                if (user) {
                    user.plan = 'builder';
                    if (event.data?.subscription_id) {
                        user.razorpaySubscriptionId = event.data.subscription_id;
                    }
                    user.cancelAtPeriodEnd = false;
                    user.currentPeriodEnd = undefined;
                    await user.save();
                    console.log(`[Dodo Webhook] User ${customerEmail} upgraded to Builder plan.`);
                }
            }
        } else if (event.type === 'subscription.cancelled' || event.type === 'subscription.expired') {
            if (customerEmail) {
                // If they cancelled but it's set to expire at the end of the period, don't downgrade yet.
                // We will get a 'subscription.expired' event later.
                if (event.type === 'subscription.cancelled' && event.data?.cancel_at_next_billing_date) {
                    console.log(`[Dodo Webhook] User ${customerEmail} cancelled, but keeping plan active until period end.`);
                    return NextResponse.json({ received: true });
                }

                const user = await User.findOne({ email: customerEmail });
                if (user) {
                    user.plan = 'starter';
                    user.razorpaySubscriptionId = undefined;
                    user.cancelAtPeriodEnd = false;
                    user.currentPeriodEnd = undefined;
                    await user.save();
                    console.log(`[Dodo Webhook] User ${customerEmail} downgraded to Starter plan.`);
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('[Dodo Webhook Error]:', error);
        return NextResponse.json({ error: 'Webhook handler error' }, { status: 400 });
    }
}
