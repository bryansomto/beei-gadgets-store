import { mongooseConnect } from "@/lib/mongoose";
import { Admin } from "@/models/Admin";
import { NextRequest, NextResponse } from "next/server";


// GET /api/admins - Fetch all admins
export async function GET(request: Request) {
  try {
    await mongooseConnect();

    // Extract email from URL if provided
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (email) {
      // Fetch single admin by email
      const admin = await Admin.findOne({ email });
      
      if (!admin) {
        return NextResponse.json(
          { error: 'Admin not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(admin);
    }

    // No email provided - fetch all admins
    const admins = await Admin.find();
    return NextResponse.json(admins);

  } catch (error) {
    console.error('❌ Error fetching admins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admins' },
      { status: 500 }
    );
  }
}

// POST /api/admins - Add a new admin
export async function POST(req: NextRequest) {
    try {
      const { email } = await req.json();
  
      if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
      }
  
      await mongooseConnect();
  
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return NextResponse.json({ error: "Email already exists" }, { status: 409 });
      }
  
      const newAdmin = await Admin.create({ email });
      return NextResponse.json(newAdmin, { status: 201 });
  
    } catch (error) {
      console.error("❌ Error creating admin:", error);
      return NextResponse.json({ error: "Failed to create admin" }, { status: 500 });
    }
  }


// DELETE /api/admins - Remove an admin
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const _id = url.searchParams.get("_id");

    if (!_id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 }); // Updated message
    }

    await mongooseConnect();
    const deletedAdmin = await Admin.findByIdAndDelete(_id);

    if (!deletedAdmin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Admin deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("❌ Error deleting admin:", error);
    return NextResponse.json({ error: "Failed to delete admin" }, { status: 500 });
  }
}
