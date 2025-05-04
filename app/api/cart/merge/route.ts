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

  if (!Array.isArray(guestItems) || guestItems.length === 0) {
    return NextResponse.json({ message: "No guest items provided" }, { status: 400 });
  }

  // Merge and deduplicate guest items first
  const mergedGuestItems = guestItems.reduce<Record<string, GuestItem>>((acc, item) => {
    const id = item.productId;
    if (!acc[id]) {
      acc[id] = { ...item };
    } else {
      acc[id].quantity += item.quantity;
    }
    return acc;
  }, {});

  // Start transaction to ensure data consistency
  let cart = await Cart.findOne({ userId }).populate("items");

  if (!cart) {
    cart = await Cart.create({ userId, items: [], total: 0 });
  }

  // Create a map of existing items for quick lookup
  const existingItemsMap = new Map<string, { _id: string; productId: string; quantity: number }>(
    cart.items.map((item: any) => [item.productId.toString(), item])
  );

  // Process each merged guest item
  for (const guestItem of Object.values(mergedGuestItems)) {
    const product = await Product.findById(guestItem.productId);
    if (!product) {
      console.warn(`Product not found: ${guestItem.productId}`);
      continue; // Skip instead of returning error
    }

    const existingItem = existingItemsMap.get(guestItem.productId);

    if (existingItem) {
      // Update existing item
      const dbItem = await CartItem.findById(existingItem._id);
      if (dbItem) {
        // Ensure we don't exceed available stock if needed
        dbItem.quantity = Math.min(dbItem.quantity + guestItem.quantity, product.stock || Infinity);
        await dbItem.save();
      }
    } else {
      // Create new item
      const newItem = await CartItem.create({
        productId: guestItem.productId,
        quantity: Math.min(guestItem.quantity, product.stock || Infinity),
        price: guestItem.price,
      });
      cart.items.push(newItem);
      existingItemsMap.set(guestItem.productId, newItem); // Add to map
    }
  }

  // Save cart before repopulating
  await cart.save();

  // Repopulate to get fresh data
  const updatedCart = await Cart.findOne({ userId })
    .populate({
      path: 'items',
      populate: {
        path: 'productId',
        model: 'Product'
      }
    });

  if (!updatedCart) {
    return NextResponse.json({ message: "Cart not found after update" }, { status: 404 });
  }

  // Recalculate total
  updatedCart.total = updatedCart.items.reduce(
    (sum: number, item: any) => sum + item.quantity * item.price,
    0
  );

  await updatedCart.save();

  return NextResponse.json({ 
    message: "Cart merged successfully",
    cart: updatedCart 
  }, { status: 200 });
}
