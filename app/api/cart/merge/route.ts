import { auth } from "@/auth";
import { mongooseConnect } from "@/lib/mongoose";
import { Cart } from "@/models/Cart";
import { CartItem } from "@/models/CartItem";
import Product from "@/models/Product";
import { NextRequest, NextResponse } from "next/server";

type GuestItem = {
  productId: string;
  quantity: number;
  price: number;
};

export async function POST(req: NextRequest) {
  await mongooseConnect();
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;
  const { guestItems }: { guestItems: GuestItem[] } = await req.json();

  console.log("Received guestItems:", guestItems);

  if (!Array.isArray(guestItems) || guestItems.length === 0) {
    return NextResponse.json({ message: "No guest items provided" }, { status: 400 });
  }

  let cart = await Cart.findOne({ userId }).populate("items");

  if (!cart) {
    // If no cart exists, create a new one
    cart = await Cart.create({ userId, items: [], total: 0 });
  }

  for (const guestItem of guestItems) {
    const product = await Product.findById(guestItem.productId);
    if (!product){
      return NextResponse.json({ message: `Product not found: ${guestItem.productId}` }, { status: 404 });
    };
    if (!guestItem.productId || !guestItem.quantity || !guestItem.price) {
      return NextResponse.json({ message: "Invalid guest item data" }, { status: 400 });
    }
    const existingItem = await CartItem.findOne({
      _id: { $in: cart.items },
      productId: product._id,
    });

    if (existingItem) {
      existingItem.quantity += guestItem.quantity;
      await existingItem.save();
    } else {
      const newItem = await CartItem.create({
        productId: product._id,
        quantity: guestItem.quantity,
        price: product.price,
      });
      cart.items.push(newItem);
    }
  }

  // Ensure cart.items is populated correctly before iterating
  if (!Array.isArray(cart.items)) {
    console.error("Cart items are not an array:", cart.items);
    return NextResponse.json({ message: "Cart items format is invalid" }, { status: 400 });
  }

  cart.total = cart.items.reduce(
    (sum: number, item: any) => sum + item.quantity * item.price,
    0
  );

  await cart.save();

  return NextResponse.json({ message: "Cart merged successfully" }, { status: 200 });
}