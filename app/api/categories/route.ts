import { mongooseConnect } from "@/lib/mongoose";
import { categorySchema } from "@/lib/validation/categorySchema";
import Category from "@/models/Category";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await mongooseConnect();
    const categories = await Category.find().populate("parent");
    return NextResponse.json(categories, { status: 200 });
  } catch (err) {
    console.error("GET /categories error:", err);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await mongooseConnect();
    
    // Parse the incoming JSON body
    const body = await req.json();

    const parseResult = categorySchema.safeParse(body);

    // If validation fails, return a detailed error
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors }, // Detailed Zod errors
        { status: 400 }
      );
    }

    const { name, parentCategory, properties } = parseResult.data;

    const newCategory = await Category.create({
      name,
      parent: parentCategory || undefined,
      properties: properties?.map(p => ({
        name: p.name,
        values: Array.isArray(p.values) ? p.values : p.values.split(",").map(v => v.trim()), // Ensure `values` is an array
      })),
    });

    return NextResponse.json(newCategory, { status: 201 });

  } catch (err: unknown) {
    console.error("POST /categories error:", err);
    return NextResponse.json({ error: "Failed to create category", details: (err instanceof Error) ? err.message : "Unknown error occurred" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await mongooseConnect();
    const body = await req.json();

    const parseResult = categorySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.errors }, { status: 400 });
    }

    const { _id, name, parentCategory, properties } = parseResult.data;

    if (!_id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const updated = await Category.findByIdAndUpdate(
      _id,
      {
        name,
        parent: parentCategory || undefined,
        properties: properties?.map(p => ({
          name: p.name,
          values: typeof p.values === "string" ? p.values.split(",").map(v => v.trim()) : p.values,
        })),
      },
      { new: true }
    );

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("PUT /categories error:", err);
    return NextResponse.json({ error: "Failed to update category", details: (err instanceof Error) ? err.message : "Unknown error occurred" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await mongooseConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      // Support batch deletion via comma-separated IDs
      const ids = id.split(",").map((i) => i.trim());
      await Category.deleteMany({ _id: { $in: ids } });
      return NextResponse.json({ message: "Categories deleted successfully" });
    }

    // Otherwise expect JSON body (fallback)
    const { ids } = await req.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No category IDs provided" }, { status: 400 });
    }

    await Category.deleteMany({ _id: { $in: ids } });
    return NextResponse.json({ message: "Categories deleted successfully" });
  } catch (err) {
    console.error("DELETE /categories error:", err);
    return NextResponse.json({ error: "Failed to delete categories" }, { status: 500 });
  }
}