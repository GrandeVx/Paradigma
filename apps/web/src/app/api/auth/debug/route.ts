import { NextResponse } from "next/server";

export async function GET() {
    console.log("🔍 [Debug] Testing BetterAuth import and initialization");
    
    try {
        // Test importing the auth instance
        const { auth } = await import("@paradigma/auth/server");
        console.log("✅ [Debug] BetterAuth import successful");
        
        // Test if auth instance exists
        if (auth) {
            console.log("✅ [Debug] BetterAuth instance exists");
            return NextResponse.json({
                status: "success",
                message: "BetterAuth initialization successful",
                timestamp: new Date().toISOString()
            });
        } else {
            console.error("❌ [Debug] BetterAuth instance is null/undefined");
            return NextResponse.json({
                status: "error",
                message: "BetterAuth instance is null",
                timestamp: new Date().toISOString()
            }, { status: 500 });
        }
        
    } catch (error) {
        console.error("❌ [Debug] BetterAuth initialization failed:", error);
        return NextResponse.json({
            status: "error",
            message: "BetterAuth initialization failed",
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
} 