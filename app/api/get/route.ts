import { NextResponse } from "next/server";
import supabase from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "5", 10);

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    // Fetch paginated wishes
    const { data: wishes, count, error } = await supabase
      .from('wishes')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return NextResponse.json({
      wishes,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching wishes:", error);
    return NextResponse.json(
      { message: "Error fetching wishes", error },
      { status: 500 }
    );
  }
}
