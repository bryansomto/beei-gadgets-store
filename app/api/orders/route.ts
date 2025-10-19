import { NextRequest, NextResponse } from "next/server";
import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";

export async function GET(req: NextRequest) {
  try {
    await mongooseConnect();
    
    const orders = await Order.find().sort({ createdAt: -1 });
    console.log("Fetched orders:", orders);
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" }, 
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await mongooseConnect();
    
    const body = await req.json();
    const { OrderId, orderStatus } = body;

    if (!OrderId) {
      return NextResponse.json(
        { error: "Missing OrderId" }, 
        { status: 400 }
      );
    }

    const updateData = orderStatus ? { paid: false } : { paid: true };
    
    await Order.updateOne({ _id: OrderId }, updateData);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" }, 
      { status: 500 }
    );
  }
}