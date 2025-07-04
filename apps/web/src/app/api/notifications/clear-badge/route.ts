import { NextRequest, NextResponse } from "next/server";
import { db } from "@paradigma/db";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, notificationToken: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Log the badge clear action (optional - for analytics)
    console.log(`📱 Badge cleared for user ${userId}`);

    return NextResponse.json({
      success: true,
      message: "Badge cleared successfully",
    });
  } catch (error) {
    console.error("❌ Error clearing badge:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to clear badge",
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}