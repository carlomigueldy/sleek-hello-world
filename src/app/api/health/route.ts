import { NextResponse } from "next/server";

const startedAt = Date.now();

export function GET() {
  return NextResponse.json({
    status: "ok",
    uptime: Math.floor((Date.now() - startedAt) / 1000),
  });
}
