import { auth } from "@paradigma/auth/server";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

console.log("🔄 [Auth Handler] Initializing toNextJsHandler...");

// Test if toNextJsHandler works
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let authHandlers: any;
try {
    authHandlers = toNextJsHandler(auth);
    console.log("✅ [Auth Handler] toNextJsHandler created successfully");
} catch (error) {
    console.error("❌ [Auth Handler] toNextJsHandler failed:", error);
    authHandlers = null;
}

export async function POST(request: NextRequest) {
    console.log("🔗 [Auth API] POST request received");
    
    if (!authHandlers) {
        console.error("❌ [Auth API] authHandlers is null");
        return NextResponse.json({ error: "Auth handler not initialized" }, { status: 500 });
    }
    
    try {
        const response = await authHandlers.POST(request);
        console.log("✅ [Auth API] POST successful");
        return response;
    } catch (error) {
        console.error("❌ [Auth API] POST error:", error);
        return NextResponse.json({ error: "Auth POST failed" }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    console.log("🔗 [Auth API] GET request received");
    
    if (!authHandlers) {
        console.error("❌ [Auth API] authHandlers is null");
        return NextResponse.json({ error: "Auth handler not initialized" }, { status: 500 });
    }
    
    try {
        const response = await authHandlers.GET(request);
        console.log("✅ [Auth API] GET successful");
        return response;
    } catch (error) {
        console.error("❌ [Auth API] GET error:", error);
        return NextResponse.json({ error: "Auth GET failed" }, { status: 500 });
    }
}