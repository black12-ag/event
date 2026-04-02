import { NextResponse } from "next/server";
import supabase from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, attendance, guests, message } = await req.json();
    
    const { error } = await supabase
      .from('wishes')
      .insert([
        { name, attendance, guests, message }
      ]);

    if (error) throw error;

    return NextResponse.json(
      {
        message: "RSVP submitted successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return new NextResponse("Failed to submit RSVP", { status: 500 });
  }
}
