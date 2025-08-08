import { auth } from "@paradigma/auth/server";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let authHandlers: any;
try {
    authHandlers = toNextJsHandler(auth);
} catch (error) {
    authHandlers = null;
}

export async function POST(request: NextRequest) {
    if (!authHandlers) {
        return NextResponse.json({ error: "Auth handler not initialized" }, { status: 500 });
    }
    
    try {
        const response = await authHandlers.POST(request);
        return response;
    } catch (error) {
        return NextResponse.json({ error: "Auth POST failed" }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    if (!authHandlers) {
        return NextResponse.json({ error: "Auth handler not initialized" }, { status: 500 });
    }
    
    try {
        const response = await authHandlers.GET(request);
        return response;
    } catch (error) {
        return NextResponse.json({ error: "Auth GET failed" }, { status: 500 });
    }
}