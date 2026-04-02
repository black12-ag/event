export const runtime = "edge";

import { NextResponse } from "next/server";
import { markInviteOpened } from "@/lib/event-data";

export async function POST(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await markInviteOpened(params.slug);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to mark invite open." }, { status: 500 });
  }
}
