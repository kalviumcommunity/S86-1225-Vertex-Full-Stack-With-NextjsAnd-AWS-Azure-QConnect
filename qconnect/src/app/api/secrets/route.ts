import { NextResponse } from "next/server";
import { getSecrets } from "@/lib/secrets";
import { logger } from "@/lib/logger";

export async function GET() {
  const requestId = Date.now().toString();
  try {
    const secrets = await getSecrets();
    // For safety, return only keys (never values) for verification
    logger.info('Fetched secrets keys', { requestId, keys: Object.keys(secrets) });
    return NextResponse.json({ success: true, keys: Object.keys(secrets) });
  } catch (e: any) {
    logger.error('Failed to fetch secrets', { requestId, error: e?.message || e });
    return NextResponse.json({ success: false, message: 'Failed to fetch secrets' }, { status: 500 });
  }
}
