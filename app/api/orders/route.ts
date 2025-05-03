import { auth } from "@/auth";
import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface CreateOrderRequest {
  userEmail: string;
  items: OrderItem[];
  total: number;
  address: Address;
}

export async function GET() {
  try {
    await mongooseConnect();
    const orders = await Order.find().sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (err) {
    console.error("Failed to fetch orders:", err);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const { userEmail, items, total, address }: CreateOrderRequest = await req.json();

    if (!session?.user?.email || session.user.email !== userEmail) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!items?.length || total <= 0 || !address) {
      return NextResponse.json(
        { error: "Invalid order data" },
        { status: 400 }
      );
    }

    const order = new Order({
      userEmail,
      items,
      total,
      address,
      status: "pending",
      paid: false,
    });

    await order.save();
    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    console.error("Failed to create order:", err);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { orderId, paid }: { orderId: string; paid: boolean } = await req.json();

    if (!Types.ObjectId.isValid(orderId) || typeof paid !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Optional: Verify the user owns this order if needed
    const order = await Order.findById(orderId);
    if (order.userEmail !== session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { paid },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (err) {
    console.error("Failed to update order:", err);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}