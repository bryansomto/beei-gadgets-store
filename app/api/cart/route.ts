// app/api/cart/route.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { Cart } from "@/models/Cart";
import { mongooseConnect } from "@/lib/mongoose";
import { Types } from "mongoose";
import { ICartItem } from "@/models/CartItem";

interface IProduct {
  _id: Types.ObjectId;
  name: string;
  price: number;
  images?: string[];
}

interface PopulatedCartItem extends Omit<ICartItem, "productId"> {
  productId: IProduct;
}

interface CartWithItems {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  items: PopulatedCartItem[];
  total: number;
  __v?: number;
}

export async function GET() {
  try {
    await mongooseConnect();
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ items: [], total: 0 }, { status: 200 });
    }

    const userId = session.user.id;

    const cart = await Cart.findOne({ userId })
      .populate<{ items: PopulatedCartItem[] }>({
        path: "items",
        populate: { 
          path: "productId",
          select: "name price images"
        }
      })
      .lean()
      .exec() as CartWithItems | null;

    if (!cart) {
      return NextResponse.json({ items: [], total: 0 }, { status: 200 });
    }

    // Transform to match frontend CartItem type exactly
    const items = cart.items.map((item) => ({
      productId: item.productId._id.toString(),
      name: item.productId.name,
      price: item.productId.price,
      image: item.productId.images?.[0] || "",
      quantity: item.quantity
    }));

    return NextResponse.json(
      { 
        items,  // Must match CartItem[] type exactly
        total: cart.total 
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { message: "Failed to load cart" }, 
      { status: 500 }
    );
  }
}