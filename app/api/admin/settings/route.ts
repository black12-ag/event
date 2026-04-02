import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getEventSettings, saveEventSettings } from "@/lib/event-data";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const settings = await getEventSettings();
  return NextResponse.json({ settings });
}

export async function PUT(req: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const payload = await req.json();
    const settings = await saveEventSettings(payload);
    return NextResponse.json({ settings });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to save settings." }, { status: 500 });
  }
}
