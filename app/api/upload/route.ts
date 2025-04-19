import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { IncomingMessage } from "http";
import fs from "fs";
import { mongooseConnect } from "@/lib/mongoose";

var multiparty = require('multiparty');
var mime = require('mime-types')

// Disable built-in body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

// Convert Fetch API Request to Node.js IncomingMessage-like object
function convertRequestToStream(req: Request): IncomingMessage {
  const readable = Readable.fromWeb(req.body as any) as unknown as IncomingMessage;
  readable.headers = Object.fromEntries(req.headers.entries());
  readable.method = req.method || "POST";
  return readable;
}

// Wrapper to parse form using multiparty
function parseForm(req: IncomingMessage): Promise<{ fields: any; files: any }> {
  const form = new multiparty.Form();
  return new Promise((resolve, reject) => {
    form.parse(req, (err: Error | null, fields: Record<string, any>, files: Record<string, any>) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

// AWS S3 bucket config
const Bucket = process.env.S3_BUCKET_NAME!;

export async function POST(req: NextRequest) {
  try {
    await mongooseConnect();

    const streamReq = convertRequestToStream(req);
    const { fields, files } = await parseForm(streamReq);

    const client = new S3Client({
      region: process.env.S3_REGION!,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    });

    const links: string[] = [];

    for (const file of files.file) {
      const ext = file.originalFilename.split(".").pop();
      const newFilename = `${Date.now()}.${ext}`;
      const fileBuffer = fs.readFileSync(file.path);

      if (!Bucket) {
        console.error("Missing S3_BUCKET_NAME in environment");
        return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
      }

      await client.send(
        new PutObjectCommand({
          Bucket: Bucket,
          Key: newFilename,
          Body: fileBuffer,
          ContentType: mime.lookup(file.path) || "application/octet-stream",
          ACL: "public-read",
        })
      );

      links.push(`https://${Bucket}.s3.us-east-1.amazonaws.com/${newFilename}`);
    }

    return NextResponse.json({ links });
  } catch (error) {
    console.error("Upload error:", error);
    return new NextResponse("Upload failed", { status: 500 });
  }
}
