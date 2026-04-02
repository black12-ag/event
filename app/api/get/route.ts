import { NextResponse } from "next/server"; // For new Next.js API route handling
import connectToDatabase from "@/lib/db";
import Wish from "@/lib/models/Wish";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10); // Get page number from query, default to 1
  const limit = parseInt(searchParams.get("limit") || "5", 10); // Get limit from query, default to 5

  try {
    await connectToDatabase();

    // Fetch paginated wishes
    const wishes = await Wish.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalWishes = await Wish.countDocuments();

    return NextResponse.json({
      wishes,
      totalPages: Math.ceil(totalWishes / limit),
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
