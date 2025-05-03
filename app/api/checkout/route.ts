import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { cart, name, email, address, totalPrice } = await req.json();

    if (!name || !email || !address) {
        return NextResponse.json({
            error: "All fields are required",

        }, {status: 400})
    }
}