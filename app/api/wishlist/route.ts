// app/api/wishlist/route.ts
import { NextResponse } from "next/server";
import { Wishlist } from "@/models/Wishlist";
import { mongooseConnect } from "@/lib/mongoose";
import { auth } from "@/auth";
import { Product } from "@/models/Product";

interface WishlistRequest {
  productId: string;
}

export async function GET(req: Request) {
  try {
    await mongooseConnect();
    const session = await auth();

    console.log("Session:", session);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wishlist = await Wishlist.findOne({ user: session.user.id })
      .populate<{ products: typeof Product.schema.obj[] }>("products")
      .lean()
      .exec();

    console.log("Fetched wishlist:", wishlist);

    if (!wishlist) {
      return NextResponse.json([], { status: 200 });
    }

    // Type guard to ensure products exists
    const products = 'products' in wishlist ? wishlist.products : [];
    
    // Transform the data to ensure proper serialization
    const serializedProducts = products.map(product => ({
      _id: product._id?.toString() ?? "unknown",
      name: product.name,
      price: product.price,
      images: product.images,
      // include other necessary fields
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

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: session.user.id,
        products: [productId],
      });
    } else if (!wishlist.products.includes(productId as any)) {
      wishlist.products.push(productId as any);
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
      { $pull: { products: productId } }
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