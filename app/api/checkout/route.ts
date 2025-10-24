import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Address {
  name: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface CreateOrderRequest {
  userEmail: string;
  userName: string;
  items: OrderItem[];
  total: number;
  address: Address;
  paymentMethod: "debit_card" | "bank_transfer" | "call_rep";
}

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function GET() {
  try {
    await mongooseConnect();
    const orders = await Order.find().sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (err: unknown) {
    console.error("Failed to fetch orders:", err);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

async function initializePaystackPayment(
  amount: number,
  email: string,
  name: string,
  phone: string,
  orderId: string,
  paymentMethod: string
) {
  try {
    const amountInKobo = Math.round(amount * 100);

    const payload = {
      email,
      amount: amountInKobo,
      metadata: {
        orderId,
        customerName: name,
        customerPhone: phone,
        paymentMethod,
      },
      callback_url: `${process.env.NEXT_PUBLIC_API_URL}/payment/paystack/callback`,
    };

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to initialize Paystack payment");
    }

    return data.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Paystack initialization error:", error.message);
      throw new Error(error.message);
    } else {
      console.error("Unknown Paystack initialization error:", error);
      throw new Error("Payment initialization failed");
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const {
      userEmail,
      userName,
      items,
      total,
      address,
      paymentMethod,
    }: CreateOrderRequest = await req.json();

    if (!session?.user?.email || session.user.email !== userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!items?.length || total <= 0 || !address || !paymentMethod) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }

    if (!PAYSTACK_SECRET_KEY) {
      throw new Error("Paystack configuration error: Missing API key");
    }

    await mongooseConnect();

    const order = new Order({
      userEmail,
      userName,
      items,
      total,
      address,
      paymentMethod,
      status: "pending",
      paid: false,
    });

    await order.save();

    if (paymentMethod === "call_rep") {
      return NextResponse.json({
        success: true,
        orderId: order._id,
        message: "Order created. You will be called shortly.",
      });
    }

    const orderId = order._id?.toString() || order.id;
    const paystackData = await initializePaystackPayment(
      total,
      address.email,
      address.name,
      address.phone,
      orderId,
      paymentMethod
    );

    return NextResponse.json({
      success: true,
      orderId: order._id,
      authorizationUrl: paystackData.authorization_url,
      accessCode: paystackData.access_code,
      reference: paystackData.reference,
      message: "Payment initialized successfully",
    });
  } catch (error: unknown) {
    let message = "Checkout failed";
    if (error instanceof Error) message = error.message;

    console.error("Checkout error:", message);

    return NextResponse.json(
      {
        success: false,
        error: message,
        message: "Please try again or contact support",
      },
      { status: 500 }
    );
  }
}
