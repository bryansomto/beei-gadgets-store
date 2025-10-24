// app/api/cart/clear/route.ts
import { auth } from "@/auth";
import { mongooseConnect } from "@/lib/mongoose";
import { Cart } from "@/models/Cart";
import { CartItem } from "@/models/CartItem";
import { NextResponse } from "next/server";
import type { Types } from "mongoose";

export async function DELETE() {
  try {
    await mongooseConnect();
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const cart = await Cart.findOne({ userId }).populate("items");

    if (!cart) {
      return NextResponse.json({ message: "Cart not found" }, { status: 404 });
    }

    // Strongly type item IDs instead of using `any`
    const itemIds = cart.items.map(
      (item: { _id: Types.ObjectId }) => item._id
    );

    await CartItem.deleteMany({ _id: { $in: itemIds } });

    cart.items = [];
    cart.total = 0;
    await cart.save();

    return NextResponse.json(
      { message: "Cart cleared successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error clearing cart:", error);
    return NextResponse.json(
      { message: "Failed to clear cart" },
      { status: 500 }
    );
  }
}
