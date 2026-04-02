import { NextResponse } from "next/server";
import { submitGeneralWish } from "@/lib/event-data";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { name, attendance, guests, message } = await req.json();

    if (!name || !message) {
      return NextResponse.json({ message: "Name and message are required." }, { status: 400 });
    }

    await submitGeneralWish(name, message, attendance || "attending", Number(guests || 1));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to submit message." }, { status: 500 });
  }
}
