import { mongooseConnect } from "@/lib/mongoose";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { NextRequest, NextResponse } from "next/server";

// Cache configuration
export const revalidate = 3600; // Revalidate data every hour

// GET /api/products?id=123&category=electronics&limit=10&featured=true
export async function GET(req: NextRequest) {
  try {
    await mongooseConnect();

    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");
    const categoryName = searchParams.get("category");
    const categoryId = searchParams.get("categoryId");
    const excludeId = searchParams.get('excludeId');
    const limit = parseInt(searchParams.get("limit") || "0");
    const skip = parseInt(searchParams.get("skip") || "0"); // Support skip for pagination
    const featured = searchParams.get("featured") === "true";
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "Infinity");
    const search = searchParams.get("search");

    // 🟰 Handle single product request by ID
    if (id) {
      const product = await Product.findById(id)
        .populate('category')
        .lean();

      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      return NextResponse.json(product);
    }

    // 🛠 Build filter object
    const filter: any = {
      price: { $gte: minPrice, $lte: maxPrice },
    };

    if (featured) {
      filter.featured = true;
    }

    if (categoryId || categoryName) {
      let categoryDoc;
      
      if (categoryId) {
        // First try to find by ID
        categoryDoc = await Category.findById(categoryId);
      } else if (categoryName) {
        // Fall back to name search if no ID provided
        categoryDoc = await Category.findOne({ name: categoryName });
      }
      
      if (!categoryDoc) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
      filter.category = categoryDoc._id;
    }

    if (excludeId) {
      filter._id = { $ne: excludeId }; // Exclude specific product ID
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // 🛒 Fetch products
    const productsQuery = Product.find(filter)
      .sort({ createdAt: -1 })
      .populate("category")
      .lean();

    if (limit > 0) {
      productsQuery.limit(limit);
    }

    if (skip > 0) {
      productsQuery.skip(skip);
    }

    const [products, totalProducts] = await Promise.all([
      productsQuery,
      Product.countDocuments(filter)
    ]);

    // ✅ Always return products as an array
    return NextResponse.json({
      success: true,
      products: Array.isArray(products) ? products : [],
      totalProducts,
    });

  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
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

    // Validate price is positive
    if (body.price && body.price < 0) {
      return NextResponse.json(
        { error: "Price must be positive" },
        { status: 400 }
      );
    }

    const newProduct = await Product.create({
      name: body.name,
      description: body.description || "",
      price: body.price || 0,
      images: body.images || [],
      category: body.category,
      properties: body.properties || {},
      featured: body.featured || false,
      stock: body.stock || 0,
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

    // Validate price is positive if being updated
    if (updateData.price && updateData.price < 0) {
      return NextResponse.json(
        { error: "Price must be positive" },
        { status: 400 }
      );
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, runValidators: true }
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

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("❌ Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}