import { auth } from "@/auth";
import { mongooseConnect } from "@/lib/mongoose";
import { Cart } from "@/models/Cart";
import { CartItem } from "@/models/CartItem";
import Product from "@/models/Product";
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

interface FrontendCartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    await mongooseConnect();
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id;
    const { cartItems }: { cartItems: FrontendCartItem[] } = await req.json();

    if (!Array.isArray(cartItems)) {
      return NextResponse.json({ message: "Invalid cart data" }, { status: 400 });
    }

    // Get or create cart
    let cart = await Cart.findOne({ userId }).populate("items") || 
               await Cart.create({ userId, items: [], total: 0 });

    // Create a map of incoming items for easy lookup
    const incomingItemsMap = new Map<string, FrontendCartItem>();
    cartItems.forEach(item => {
      incomingItemsMap.set(item.productId, item);
    });

    // Process existing cart items
    const itemsToKeep: Types.ObjectId[] = [];
    let total = 0;

    // First pass: update existing items
    for (const existingItem of cart.items) {
      const existingItemId = existingItem.productId.toString();
      const incomingItem = incomingItemsMap.get(existingItemId);

      if (incomingItem) {
        // Update existing item
        existingItem.quantity = incomingItem.quantity;
        existingItem.price = incomingItem.price;
        await existingItem.save();
        itemsToKeep.push(existingItem._id);
        total += incomingItem.quantity * incomingItem.price;
        incomingItemsMap.delete(existingItemId); // Mark as processed
      }
    }

    // Second pass: add new items
    for (const [productId, incomingItem] of incomingItemsMap) {
      const product = await Product.findById(productId);
      if (!product) {
        console.warn(`Product not found: ${productId}`);
        continue;
      }

      const newItem = await CartItem.create({
        productId: product._id,
        quantity: incomingItem.quantity,
        price: incomingItem.price,
        name: product.name,
        image: product.images?.[0] || '',
      });
      
      itemsToKeep.push(newItem._id);
      total += incomingItem.quantity * incomingItem.price;
    }

    // Update cart with only the items we want to keep
    cart.items = itemsToKeep;
    cart.total = total;
    await cart.save();

    return NextResponse.json({ 
      success: true,
      itemCount: itemsToKeep.length,
      total
    }, { status: 200 });

  } catch (error) {
    console.error("Error saving cart:", error);
    return NextResponse.json(
      { message: "Failed to save cart" }, 
      { status: 500 }
    );
  }
}