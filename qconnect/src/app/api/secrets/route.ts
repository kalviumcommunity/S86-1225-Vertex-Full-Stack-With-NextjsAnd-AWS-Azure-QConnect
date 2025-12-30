import { NextResponse } from "next/server";
import { getSecrets } from "@/lib/secrets";

export async function GET() {
  try {
    const secrets = await getSecrets();
    // For safety, return only keys (never values) for verification
    return NextResponse.json({ success: true, keys: Object.keys(secrets) });
  } catch (e: any) {
    console.error('Failed to fetch secrets', e);
    return NextResponse.json({ success: false, message: 'Failed to fetch secrets' }, { status: 500 });
  }
}
