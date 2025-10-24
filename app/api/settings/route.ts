import { mongooseConnect } from "@/lib/mongoose";
import { Setting } from "@/models/Setting";
import { NextRequest, NextResponse } from "next/server";

// Handler for GET request to fetch settings by name
export async function GET(req: NextRequest) {
  try {
    const name = req.nextUrl.searchParams.get("name");
    const setting = await Setting.findOne({ name });
    if (setting) {
      return NextResponse.json(setting);
    } else {
      return NextResponse.json({ message: "Setting not found" }, { status: 404 });
    }
  } catch {
    return NextResponse.error();
  }
}

// PUT handler
export async function PUT(req: NextRequest) {
  try {
    const { name, value } = await req.json();
    
    if (!name || value === undefined) {
      return NextResponse.json({ message: "Name and value are required" }, { status: 400 });
    }

    await mongooseConnect();

    let settingDoc = await Setting.findOne({ name });

    if (settingDoc) {
      settingDoc.value = value;
      await settingDoc.save();
      return NextResponse.json(settingDoc);
    } else {
      settingDoc = await Setting.create({ name, value });
      return NextResponse.json(settingDoc);
    }
  } catch {
    return NextResponse.error();
  }
}
