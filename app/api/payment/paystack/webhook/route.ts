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
    const body = await req.arrayBuffer();
    const signature = req.headers.get('x-paystack-signature');

    if (!verifyPaystackWebhook(Buffer.from(body), signature)) {
      console.warn('Invalid Paystack webhook signature');
      return NextResponse.json({ received: true }); // Always return 200
    }

    let event: PaystackEvent;
    try {
      event = JSON.parse(Buffer.from(body).toString());
    } catch (err) {
      console.error("Invalid JSON in webhook:", err);
      return NextResponse.json({ received: true });
    }

    if (event.event !== 'charge.success') {
      console.log(`Ignoring event: ${event.event}`);
      return NextResponse.json({ received: true });
    }

    const data = event.data;
    const reference = data?.reference;
    const orderId = data?.metadata?.orderId;

    if (!orderId) {
      console.error('No orderId found in webhook metadata');
      return NextResponse.json({ received: true });
    }

    await mongooseConnect();

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          paid: true,
          status: 'paid',
          paymentReference: reference,
          paymentVerifiedAt: new Date(),
          paymentData: {
            amount: Math.round(data.amount / 100),
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
      return NextResponse.json({ received: true });
    }

    console.log(`✅ Order ${orderId} marked as paid (Ref: ${reference})`);

    // TODO: send email, update inventory, trigger fulfillment

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ received: true });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'webhook_active',
    message: 'Paystack webhook endpoint is running',
  });
}