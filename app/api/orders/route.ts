import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";
import { NextRequest, NextResponse } from "next/server";

// Handler for GET method to fetch orders
export async function GET() {
  try {
    await mongooseConnect();
    const orders = await Order.find().sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (err) {
    return NextResponse.error();
  }
}

// Handler for PUT method to update the order status (paid/unpaid)
export async function PUT(req: NextRequest) {
  try {
    const { OrderId, orderStatus } = await req.json();

    if (!OrderId || orderStatus === undefined) {
      return NextResponse.json(
        { message: "OrderId and orderStatus are required" },
        { status: 400 }
      );
    }

    // Update the order's payment status
    const updateData = orderStatus
      ? { paid: false }
      : { paid: true };

    await Order.updateOne({ _id: OrderId }, updateData);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.error();
  }
}
