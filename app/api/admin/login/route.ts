export const runtime = "edge";

import { NextResponse } from "next/server";
import { setAdminSession, verifyAdminPin } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const { pin } = await req.json();
  if (!verifyAdminPin(pin || "")) {
    return NextResponse.json({ message: "Invalid PIN." }, { status: 401 });
  }
  setAdminSession();
  return NextResponse.json({ authenticated: true });
}
