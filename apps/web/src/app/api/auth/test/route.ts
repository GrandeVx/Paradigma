import { NextResponse } from "next/server";

export async function GET() {
    console.log("🧪 [Test] Auth API test endpoint called");
    return NextResponse.json({
        message: "Auth API routing is working",
        timestamp: new Date().toISOString()
    });
}

export async function POST() {
    console.log("🧪 [Test] Auth API POST test endpoint called");
    return NextResponse.json({
        message: "Auth API POST routing is working",
        timestamp: new Date().toISOString()
    });
} 