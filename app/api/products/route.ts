import { mongooseConnect } from "@/lib/mongoose";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { NextRequest, NextResponse } from "next/server";

// GET /api/products?id=123&category=electronics&limit=10
export async function GET(req: NextRequest) {
  try {
    await mongooseConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "0");

    // Handle single product request
    if (id) {
      const product = await Product.findById(id).populate('category');
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      return NextResponse.json(product);
    }

    // Build the base query
    let query = Product.find().sort({ createdAt: -1 });

    // Apply category filter if provided
    if (category) {
      const categoryDoc = await Category.findOne({ name: category });
      if (!categoryDoc) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
      query = query.where('category').equals(categoryDoc._id);
    }

    // Apply limit if provided
    if (limit > 0) {
      query = query.limit(limit);
    }

    // Execute the query and populate category info
    const products = await query.populate('category');
    return NextResponse.json(products);

  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product
export async function POST(req: NextRequest) {
  try {
    await mongooseConnect();
    const body = await req.json();

    // Validate required fields
    if (!body.name || !body.category) {
      return NextResponse.json(
        { error: "Name and category are required" },
        { status: 400 }
      );
    }

    // Verify category exists
    const categoryExists = await Category.exists({ _id: body.category });
    if (!categoryExists) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    const newProduct = await Product.create({
      name: body.name,
      description: body.description || "",
      price: body.price || 0,
      images: body.images || [],
      category: body.category,
      properties: body.properties || [],
    });

    return NextResponse.json(newProduct, { status: 201 });

  } catch (error) {
    console.error("❌ Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

// PUT /api/products - Update a product
export async function PUT(req: NextRequest) {
  try {
    await mongooseConnect();
    const { _id, ...updateData } = await req.json();

    if (!_id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Verify product exists
    const productExists = await Product.exists({ _id });
    if (!productExists) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // If updating category, verify it exists
    if (updateData.category) {
      const categoryExists = await Category.exists({ _id: updateData.category });
      if (!categoryExists) {
        return NextResponse.json(
          { error: "Invalid category" },
          { status: 400 }
        );
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      _id,
      updateData,
      { new: true }
    ).populate('category');

    return NextResponse.json(updatedProduct);

  } catch (error) {
    console.error("❌ Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/products?id=123
export async function DELETE(req: NextRequest) {
  try {
    await mongooseConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const result = await Product.deleteOne({ _id: id });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Product deleted successfully" });

  } catch (error) {
    console.error("❌ Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}