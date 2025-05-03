import { auth } from "@/auth";
import { mongooseConnect } from "@/lib/mongoose";
import { Cart } from "@/models/Cart";
import { CartItem } from "@/models/CartItem";
import Product from "@/models/Product";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await mongooseConnect();
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id;
    const { cartItems } = await req.json();

    let cart = await Cart.findOne({ userId: userId }).populate("items");

    if (!cart) {
      cart = await Cart.create({ userId: userId, items: [], total: 0 });
    }

    const updatedItems: any[] = [];

    if (!Array.isArray(cartItems)) {
      return new Response("Invalid cart data", { status: 400 });
    }

    console.log("Cart items before processing:", cart.items);

    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);

      let cartItemFound = await CartItem.findOne({
        _id: { $in: cart.items },
        productId: item.productId,
      });

      if (cartItemFound) {
        cartItemFound.quantity = item.quantity;
        cartItemFound.price = product.price; // Update price in case it's changed
        await cartItemFound.save();
      } else {
        cartItemFound = await CartItem.create({
          productId: product._id,
          quantity: item.quantity,
          name: product.name,
          image: product.images[0], // Use the first image
          price: product.price,
        });
        cart.items.push(cartItemFound); // Add the new item to the cart
      }

      updatedItems.push(cartItemFound);
    }

    // Ensure the total is correctly updated based on all items
    cart.total = cart.items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.price,
      0
    );

    await cart.save();

    return NextResponse.json({ message: "Cart saved successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error saving cart:", error);
    return NextResponse.json({ message: "Failed to save cart" }, { status: 500 });
  }
}