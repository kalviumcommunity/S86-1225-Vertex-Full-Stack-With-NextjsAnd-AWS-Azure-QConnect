import { NextResponse } from "next/server";

export async function GET() {
  try {
    const payload = { status: "ok", uptime: process.uptime() };
    return NextResponse.json(payload, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ status: "error", message: err?.message || "Unknown" }, { status: 500 });
  }
}
