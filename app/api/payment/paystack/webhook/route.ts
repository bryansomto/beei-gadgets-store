import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Verify Paystack webhook signature
function verifyPaystackWebhook(
  body: Buffer,
  signature: string | null
): boolean {
  if (!signature || !PAYSTACK_SECRET_KEY) {
    return false;
  }

  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(body)
    .digest('hex');

  return hash === signature;
}

interface PaystackEvent {
  event: string;
  data: {
    id: number;
    reference: string;
    amount: number;
    paid_at: string;
    customer: {
      id: number;
      email: string;
      customer_code: string;
      first_name: string | null;
      last_name: string | null;
      phone: string | null;
    };
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
    };
    plan?: number | null;
    split?: Record<string, unknown>;
    order_id?: string | null;
    createdAt?: string;
    metadata?: {
      orderId?: string;
      customerName?: string;
      customerPhone?: string;
      paymentMethod?: string;
    };
  };
  reference?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Get the raw body for signature verification
    const body = await req.arrayBuffer();
    const signature = req.headers.get('x-paystack-signature');

    // Verify webhook signature
    if (!verifyPaystackWebhook(Buffer.from(body), signature)) {
      console.warn('Invalid Paystack webhook signature');
      return NextResponse.json({ received: true });
    }

    const event: PaystackEvent = JSON.parse(Buffer.from(body).toString());

    // Only process successful charge events
    if (event.event !== 'charge.success') {
      console.log(`Ignoring event: ${event.event}`);
      return NextResponse.json({ success: true, message: 'Event ignored' });
    }

    const { reference, data } = event;

    if (!reference || !data) {
      console.error('Missing reference or data in webhook');
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      );
    }

    await mongooseConnect();

    // Extract order ID from metadata
    const orderId = data.metadata?.orderId;

    if (!orderId) {
      console.error('No orderId in webhook metadata');
      return NextResponse.json(
        { error: 'No orderId found' },
        { status: 400 }
      );
    }

    // Find and update the order
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          paid: true,
          status: 'paid',
          paymentReference: reference,
          paymentVerifiedAt: new Date(),
          paymentData: {
            amount: data.amount / 100, // Convert kobo back to naira
            currency: 'NGN',
            customerEmail: data.customer.email,
            authorizationCode: data.authorization?.authorization_code,
            cardBrand: data.authorization?.brand,
            cardLastFour: data.authorization?.last4,
          },
        },
      },
      { new: true }
    );

    if (!order) {
      console.error(`Order not found: ${orderId}`);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    console.log(`Order ${orderId} payment verified and confirmed`);

    // TODO: Send confirmation email to customer
    // TODO: Trigger order fulfillment process
    // TODO: Update inventory

    return NextResponse.json({
      success: true,
      message: 'Payment verified',
      orderId: order._id,
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'webhook_active',
    message: 'Paystack webhook endpoint is running',
  });
}