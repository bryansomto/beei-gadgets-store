import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import { NextRequest, NextResponse } from "next/server";

// GET /api/products?id=123 (optional) - Get product(s)
export async function GET(req: NextRequest) {
  try {
    await mongooseConnect();

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
      const product = await Product.findById(id);
      return NextResponse.json(product);
    }

    const products = await Product.find();
    return NextResponse.json(products);
  } catch (error) {
    console.error("❌ Error fetching product(s):", error);
    return NextResponse.json({ error: "Failed to fetch product(s)" }, { status: 500 });
  }
}

// POST /api/products - Create a new product
export async function POST(req: NextRequest) {
  try {
    await mongooseConnect();

    const { name, description, price, images, category, properties } = await req.json();

    const newProduct = await Product.create({
      name,
      description,
      price,
      images,
      category,
      properties,
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

// PUT /api/products - Update a product
export async function PUT(req: NextRequest) {
  try {
    await mongooseConnect();

    const { _id, name, description, price, images, category, properties } = await req.json();

    if (!_id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    await Product.updateOne(
      { _id },
      { name, description, price, images, category, properties }
    );

    return NextResponse.json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("❌ Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE /api/products?id=123 - Delete a product
export async function DELETE(req: NextRequest) {
  try {
    await mongooseConnect();

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    await Product.deleteOne({ _id: id });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
