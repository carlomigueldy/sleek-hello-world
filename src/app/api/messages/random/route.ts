import { NextResponse } from "next/server";
import db from "@/lib/db";

interface MessageRow {
  id: number;
  content: string;
  author: string | null;
  created_at: string;
}

export function GET() {
  const row = db
    .prepare("SELECT id, content, author, created_at FROM messages ORDER BY RANDOM() LIMIT 1")
    .get() as MessageRow | undefined;

  if (!row) {
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json(row);
}
