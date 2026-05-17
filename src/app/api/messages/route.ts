import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { checkRateLimit } from "@/lib/rateLimit";

interface MessageRow {
  id: number;
  content: string;
  author: string | null;
  created_at: string;
}

function getIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  const { allowed, retryAfterMs } = checkRateLimit(getIp(request));
  if (!allowed) {
    return NextResponse.json(
      { error: "rate_limited", retryAfterMs },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_content", detail: "request body must be valid JSON" },
      { status: 400 }
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "invalid_content", detail: "body must be a JSON object" },
      { status: 400 }
    );
  }

  const raw = body as Record<string, unknown>;

  if (typeof raw.content !== "string") {
    return NextResponse.json(
      { error: "invalid_content", detail: "content must be a string" },
      { status: 400 }
    );
  }

  const content = raw.content.trim();
  if (content.length === 0 || content.length > 280) {
    return NextResponse.json(
      { error: "invalid_content", detail: "content must be between 1 and 280 characters" },
      { status: 400 }
    );
  }

  let author: string | null = null;
  if (raw.author !== undefined && raw.author !== null) {
    if (typeof raw.author !== "string") {
      return NextResponse.json(
        { error: "invalid_author", detail: "author must be a string" },
        { status: 400 }
      );
    }
    author = raw.author.trim();
    if (author.length === 0 || author.length > 40) {
      return NextResponse.json(
        { error: "invalid_author", detail: "author must be between 1 and 40 characters" },
        { status: 400 }
      );
    }
  }

  const row = db
    .prepare(
      "INSERT INTO messages (content, author) VALUES (?, ?) RETURNING id, content, author, created_at"
    )
    .get(content, author) as MessageRow;

  return NextResponse.json(row, { status: 201 });
}

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const rawLimit = params.get("limit");
  const rawBefore = params.get("before");

  let limit = 20;
  if (rawLimit !== null) {
    const parsed = Number(rawLimit);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 50) {
      return NextResponse.json(
        { error: "invalid_param", detail: "limit must be an integer between 1 and 50" },
        { status: 400 }
      );
    }
    limit = parsed;
  }

  let rows: MessageRow[];
  if (rawBefore !== null) {
    const beforeId = Number(rawBefore);
    if (!Number.isInteger(beforeId) || beforeId < 1) {
      return NextResponse.json(
        { error: "invalid_param", detail: "before must be a positive integer id" },
        { status: 400 }
      );
    }
    rows = db
      .prepare(
        "SELECT id, content, author, created_at FROM messages WHERE id < ? ORDER BY id DESC LIMIT ?"
      )
      .all(beforeId, limit + 1) as MessageRow[];
  } else {
    rows = db
      .prepare(
        "SELECT id, content, author, created_at FROM messages ORDER BY id DESC LIMIT ?"
      )
      .all(limit + 1) as MessageRow[];
  }

  const hasMore = rows.length > limit;
  const messages = hasMore ? rows.slice(0, limit) : rows;
  const nextBefore = hasMore ? messages[messages.length - 1].id : null;

  return NextResponse.json({ messages, nextBefore });
}
