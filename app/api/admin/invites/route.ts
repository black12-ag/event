export const runtime = "edge";

import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createInvite, getInviteSummary, listInvites } from "@/lib/event-data";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const [invites, summary] = await Promise.all([listInvites(), getInviteSummary()]);
  return NextResponse.json({ invites, summary });
}

export async function POST(req: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const { guestName, allowedGuests, notes, inviteType } = await req.json();
    const invite = await createInvite(
      guestName || "",
      Number(allowedGuests || 1),
      notes || "",
      inviteType === "open" ? "open" : "named"
    );
    return NextResponse.json({ invite });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to create invite." }, { status: 500 });
  }
}
