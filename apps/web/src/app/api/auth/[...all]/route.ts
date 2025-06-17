import { auth } from "@paradigma/auth/server"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest } from "next/server";

// Create handlers with logging
const authHandlers = toNextJsHandler(auth);

export async function POST(request: NextRequest) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    console.log("🔗 [Auth API] POST request:", {
        path,
        origin: request.headers.get('origin'),
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString()
    });
    
    try {
        const response = await authHandlers.POST(request);
        console.log("✅ [Auth API] POST response:", {
            path,
            status: response.status,
            timestamp: new Date().toISOString()
        });
        return response;
    } catch (error) {
        console.error("❌ [Auth API] POST error:", {
            path,
            error: error instanceof Error ? error.message : error,
            timestamp: new Date().toISOString()
        });
        throw error;
    }
}

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    console.log("🔗 [Auth API] GET request:", {
        path,
        origin: request.headers.get('origin'),
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString()
    });
    
    try {
        const response = await authHandlers.GET(request);
        console.log("✅ [Auth API] GET response:", {
            path,
            status: response.status,
            timestamp: new Date().toISOString()
        });
        return response;
    } catch (error) {
        console.error("❌ [Auth API] GET error:", {
            path,
            error: error instanceof Error ? error.message : error,
            timestamp: new Date().toISOString()
        });
        throw error;
    }
}