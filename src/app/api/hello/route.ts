import { NextRequest, NextResponse } from "next/server";
import { buildGreeting } from "@/lib/greeting";

const NAME_RE = /^[a-zA-Z0-9 '\-_.]{1,64}$/;

export function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name") ?? undefined;

  if (name !== undefined) {
    if (name.length === 0 || name.length > 64 || !NAME_RE.test(name)) {
      return NextResponse.json(
        { error: "invalid_name", detail: "name must be 1-64 alphanumeric characters" },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }
  }

  return NextResponse.json(buildGreeting(name), {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}
