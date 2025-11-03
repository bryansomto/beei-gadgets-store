import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";

export async function GET() {
  try {
    await mongooseConnect();

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const orders = await Order.find({ userEmail: session.user.email })
      .sort({ createdAt: -1 })
      .select("-__v")
      .lean();

    const transformedOrders = orders.map(order => ({
      ...order,
      _id: order._id.toString(),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map(item => ({
        ...item,
        productId: item.productId.toString(),
      })),
    }));

    return NextResponse.json(
      { 
        orders: transformedOrders,
        total: transformedOrders.length 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}