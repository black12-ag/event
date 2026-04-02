import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { clearMediaAsset, getMediaAssets, uploadMediaAsset } from "@/lib/event-data";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const media = await getMediaAssets();
  return NextResponse.json({ media });
}

export async function POST(req: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const slotKey = String(formData.get("slotKey") || "");
    const type = String(formData.get("type") || "image") as "image" | "audio";
    const file = formData.get("file") as File | null;

    if (!slotKey || !file) {
      return NextResponse.json({ message: "slotKey and file are required." }, { status: 400 });
    }

    const updated = await uploadMediaAsset(slotKey, type, file);
    const media = await getMediaAssets();
    return NextResponse.json({ updated, media });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to upload media." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const { slotKey } = await req.json();
    await clearMediaAsset(slotKey);
    const media = await getMediaAssets();
    return NextResponse.json({ media });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to clear media." }, { status: 500 });
  }
}
