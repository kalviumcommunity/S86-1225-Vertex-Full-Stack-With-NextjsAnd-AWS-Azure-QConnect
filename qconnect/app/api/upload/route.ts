import { NextResponse } from "next/server";
import { generateUploadUrl } from "@/lib/storage";

const MAX_UPLOAD_SIZE = Number(process.env.MAX_UPLOAD_SIZE || 10_000_000); // 10MB default

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { filename, fileType, size } = body || {};

    if (!filename || !fileType) {
      return NextResponse.json({ success: false, message: "filename and fileType are required" }, { status: 400 });
    }

    // Basic validation: only images and PDFs allowed
    if (!fileType.startsWith("image/") && !fileType.startsWith("application/pdf")) {
      return NextResponse.json({ success: false, message: "Unsupported file type" }, { status: 400 });
    }

    if (size && Number(size) > MAX_UPLOAD_SIZE) {
      return NextResponse.json({ success: false, message: `File too large. Max ${MAX_UPLOAD_SIZE} bytes` }, { status: 400 });
    }

    const expiresIn = Number(process.env.UPLOAD_URL_EXPIRES || 60);
    const res = await generateUploadUrl({ filename, fileType, expiresIn });

    return NextResponse.json({ success: true, upload: res });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to generate pre-signed URL" }, { status: 500 });
  }
}
