import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { Wishlist } from "@/models/Wishlist";
import { auth } from "@/auth";
import { mongooseConnect } from "@/lib/mongoose";
import { IProduct } from "@/models/Product"; // ensure this interface exists

interface WishlistRequest {
  productId: string;
}

export async function GET() {
  try {
    await mongooseConnect();
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wishlist = await Wishlist.findOne({ user: session.user.id })
      .populate<{ products: (IProduct & { _id: mongoose.Types.ObjectId })[] }>("products")
      .lean()
      .exec();

    if (!wishlist || !("products" in wishlist)) {
      return NextResponse.json([], { status: 200 });
    }

    const products = wishlist.products ?? [];

    const serializedProducts = products.map((product) => ({
      _id: (product._id as mongoose.Types.ObjectId).toString(),
      name: product.name,
      price: product.price,
      images: product.images,
      ...(product.discount && { discount: product.discount }),
      ...(product.isNew && { isNew: product.isNew }),
    }));

    return NextResponse.json(serializedProducts);
  } catch (error) {
    console.error("Failed to fetch wishlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}



export async function POST(req: Request) {
  try {
    await mongooseConnect();
    const session = await auth();
    const { productId }: WishlistRequest = await req.json();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    let wishlist = await Wishlist.findOne({ user: session.user.id });
    const productObjectId = new mongoose.Types.ObjectId(productId);

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: session.user.id,
        products: [productObjectId],
      });
    } else if (
      !wishlist.products.some((p: mongoose.Types.ObjectId) => p.equals(productObjectId))
    ) {
      wishlist.products.push(productObjectId);
      await wishlist.save();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to add to wishlist:", error);
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await mongooseConnect();
    const session = await auth();
    const { productId }: WishlistRequest = await req.json();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await Wishlist.findOneAndUpdate(
      { user: session.user.id },
      { $pull: { products: new mongoose.Types.ObjectId(productId) } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove from wishlist:", error);
    return NextResponse.json(
      { error: "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
}
