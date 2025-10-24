import { NextResponse } from "next/server";
import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";

export async function POST(req: Request) {
  try {
    const { reference, orderId } = await req.json();

    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await res.json();

    // Check for success
    if (data.data?.status === "success") {
      await mongooseConnect();

      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { paid: true, status: "processing" },
        { new: true }
      );

      if (!updatedOrder) {
        return NextResponse.json({ success: false, message: "Order not found" });
      }

      return NextResponse.json({ success: true, order: updatedOrder });
    }

    return NextResponse.json({ success: false, message: "Payment not verified" });
  } catch (error) {
    console.error("❌ Verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
