import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { IncomingMessage } from "http";
import fs from "fs";
import mime from "mime-types";
import multiparty from "multiparty";
import { mongooseConnect } from "@/lib/mongoose";

// Disable built-in body parsing for this API route
export const config = {
  api: {
    bodyParser: false,
  },
};

// Convert Fetch API Request to Node.js IncomingMessage-like object
function convertRequestToStream(req: Request): IncomingMessage {
  const webStream = req.body;

  if (!webStream) {
    throw new Error("Request body is empty");
  }

  // Convert to Node.js Readable safely
  const nodeReadable = Readable.fromWeb(webStream as unknown as import('stream/web').ReadableStream) as unknown as IncomingMessage;
  nodeReadable.headers = Object.fromEntries(req.headers.entries());
  nodeReadable.method = req.method || "POST";
  return nodeReadable;
}


// Strongly-typed version of parseForm
function parseForm(req: IncomingMessage): Promise<{ fields: Record<string, string[]>; files: Record<string, multiparty.File[]> }> {
  const form = new multiparty.Form();
  return new Promise((resolve, reject) => {
    interface ParsedFields { [key: string]: string[] }
    interface ParsedFiles { [key: string]: multiparty.File[] }

    form.parse(req, (err: Error | null, fields: Record<string, string[] | undefined>, files: Record<string, multiparty.File[] | undefined>) => {
      if (err) return reject(err);
      // Convert fields and files to remove undefined and ensure correct types
      const parsedFields: ParsedFields = Object.fromEntries(
        Object.entries(fields)
          .filter(([value]) => value !== undefined)
          .map(([key, value]) => [key, value])
      ) as ParsedFields;
      const parsedFiles: ParsedFiles = Object.fromEntries(
        Object.entries(files)
          .filter(([value]) => value !== undefined)
          .map(([key, value]) => [key, value])
      ) as ParsedFiles;
      resolve({ fields: parsedFields, files: parsedFiles });
    });
  });
}

// AWS S3 bucket name from env
const Bucket = process.env.S3_BUCKET_NAME as string;

export async function POST(req: NextRequest) {
  try {
    await mongooseConnect();

    const streamReq = convertRequestToStream(req);
    const { files } = await parseForm(streamReq);

    const client = new S3Client({
      region: process.env.S3_REGION!,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    });

    const links: string[] = [];

    for (const file of files.file) {
      const ext = file.originalFilename?.split(".").pop();
      const newFilename = `${Date.now()}.${ext}`;
      const fileBuffer = fs.readFileSync(file.path);

      if (!Bucket) {
        console.error("Missing S3_BUCKET_NAME in environment");
        return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
      }

      await client.send(
        new PutObjectCommand({
          Bucket,
          Key: newFilename,
          Body: fileBuffer,
          ContentType: mime.lookup(file.path) || "application/octet-stream",
          ACL: "public-read",
        })
      );

      links.push(`https://${Bucket}.s3.${process.env.S3_REGION}.amazonaws.com/${newFilename}`);
    }

    return NextResponse.json({ links });
  } catch (error) {
    console.error("Upload error:", error);
    return new NextResponse("Upload failed", { status: 500 });
  }
}
