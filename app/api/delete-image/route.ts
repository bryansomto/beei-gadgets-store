import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";


const s3 = new S3Client({
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: "Missing image URL" }, { status: 400 });
    }

    const Bucket = process.env.S3_BUCKET_NAME!;
    if (!Bucket) {
      console.error("Missing S3_BUCKET_NAME environment variable");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const Key = url.split("/").pop(); // get filename

    const command = new DeleteObjectCommand({ Bucket, Key });
    await s3.send(command);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Image delete error:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}