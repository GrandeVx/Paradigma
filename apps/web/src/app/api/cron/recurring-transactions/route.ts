import { NextRequest, NextResponse } from "next/server";
import { processRecurringTransactions } from "../../../../services/recurringTransactionProcessor";

export async function GET(request: NextRequest) {
  // Verify authorization header for cron job security
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    console.log("🕐 Starting recurring transactions processing...");
    
    const result = await processRecurringTransactions();
    
    console.log("✅ Recurring transactions processing completed", result);
    
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("❌ Error processing recurring transactions:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to process recurring transactions",
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}