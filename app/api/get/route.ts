import { NextResponse } from "next/server";
import { listWishes } from "@/lib/event-data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "6", 10);

  const data = await listWishes(page, limit);
  return NextResponse.json(data);
}
