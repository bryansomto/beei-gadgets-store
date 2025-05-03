import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { Cart } from "@/models/Cart";
import { ICartItem } from "@/models/CartItem";
import { mongooseConnect } from "@/lib/mongoose";

export async function GET(req: NextRequest) {
  try {
    await mongooseConnect();
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id;

    const cart = await Cart.findOne({ userId: userId }).populate({
      path: "items",
      populate: { path: "productId" },
    })
    
    // await Cart.deleteMany({ userId: null });
    // await CartItem.deleteMany({ userId: null });

    console.log(`User cart: ${JSON.stringify(cart)}`)

    if (!cart) {
      return NextResponse.json({ items: [], total: 0 }, { status: 200 });
    }

    // Format response to include product info
    const formattedItems = cart.items.map((item: ICartItem) => {
      const product = item.productId as any;
      return {
        _id: item._id,
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images?.[0] || null,
      };
    });

    console.log(`Formatted items: ${formattedItems}`)

    return NextResponse.json({ items: formattedItems, total: cart.total }, { status: 200 });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json({ message: "Failed to load cart" }, { status: 500 });
  }
}
