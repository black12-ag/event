import { NextResponse } from "next/server";
import { submitInviteRsvp } from "@/lib/event-data";

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { name, message, attendanceStatus, bringingCount } = await req.json();
    await submitInviteRsvp(
      params.slug,
      name,
      message,
      attendanceStatus === "not_attending" ? "not_attending" : "attending",
      Number(bringingCount || 1)
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to save RSVP." }, { status: 500 });
  }
}
