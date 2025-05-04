// app/api/cart/route.ts or app/api/cart/clear/route.ts
import { auth } from "@/auth";
import { mongooseConnect } from "@/lib/mongoose";
import { Cart } from "@/models/Cart";
import { CartItem } from "@/models/CartItem";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    await mongooseConnect();
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id;

    const cart = await Cart.findOne({ userId }).populate("items");

    if (!cart) {
      return NextResponse.json({ message: "Cart not found" }, { status: 404 });
    }

    // Delete all CartItem documents
    const itemIds = cart.items.map((item: any) => item._id);
    await CartItem.deleteMany({ _id: { $in: itemIds } });

    // Reset cart
    cart.items = [];
    cart.total = 0;
    await cart.save();

    return NextResponse.json({ message: "Cart cleared successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return NextResponse.json({ message: "Failed to clear cart" }, { status: 500 });
  }
}
