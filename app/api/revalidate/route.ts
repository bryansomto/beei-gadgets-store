import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { path, secret } = await req.json();

    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    if (!path) {
      return NextResponse.json({ message: "Path is required" }, { status: 400 });
    }

    revalidatePath(path);
    console.log(`✅ Revalidated path: ${path}`);

    return NextResponse.json({ revalidated: true, path });
  } catch (error) {
    console.error("❌ Error in revalidation:", error);
    return NextResponse.json({ message: "Revalidation failed" }, { status: 500 });
  }
}
