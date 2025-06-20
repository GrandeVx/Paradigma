import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { env } from "@/env.mjs";
import { appRouter } from "@paradigma/api";
import { createTRPCContext } from "@paradigma/api";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // In production, specify your mobile app domain
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
  "Access-Control-Allow-Credentials": "true",
};

// Handle preflight requests
export async function OPTIONS() {
  console.log("🔄 [tRPC] OPTIONS preflight request received");
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

const handler = async (req: NextRequest) => {
  const url = new URL(req.url);
  const method = req.method;
  
  console.log(`🚀 [tRPC] ${method} request to: ${url.pathname}`);
  console.log(`📍 [tRPC] Search params: ${url.searchParams.toString()}`);
  
  // Log request body for POST requests (mutations)
  if (method === "POST") {
    try {
      const clonedReq = req.clone();
      const body = await clonedReq.text();
      console.log(`📥 [tRPC] POST body:`, body);
      
      // Try to parse and log the procedure name
      try {
        const parsedBody = JSON.parse(body);
        if (Array.isArray(parsedBody)) {
          parsedBody.forEach((item, index) => {
            console.log(`🎯 [tRPC] Batch item ${index}: ${item.json?.input ? JSON.stringify(item.json.input) : 'no input'} - Procedure: ${url.searchParams.get('batch') ? 'batch' : 'single'}`);
          });
        } else {
          console.log(`🎯 [tRPC] Single procedure input:`, parsedBody);
        }
      } catch (parseError) {
        console.log(`⚠️ [tRPC] Could not parse body as JSON:`, parseError);
      }
    } catch (bodyError) {
      console.log(`⚠️ [tRPC] Could not read request body:`, bodyError);
    }
  }

  console.log(`⏰ [tRPC] Starting request processing at: ${new Date().toISOString()}`);
  const startTime = Date.now();

  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => {
      console.log(`🔐 [tRPC] Creating context for request`);
      return createTRPCContext({ req });
    },
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error, type, input }) => {
            console.error(`❌ [tRPC] Error on ${path ?? "<no-path>"}:`);
            console.error(`   Type: ${type}`);
            console.error(`   Input: ${JSON.stringify(input)}`);
            console.error(`   Error: ${error.message}`);
            console.error(`   Stack: ${error.stack}`);
          }
        : undefined,
  });

  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log(`✅ [tRPC] Request completed in ${duration}ms`);
  console.log(`📤 [tRPC] Response status: ${response.status}`);
  
  // Log response body for debugging (only first 500 chars to avoid spam)
  try {
    const clonedResponse = response.clone();
    const responseText = await clonedResponse.text();
    const truncatedResponse = responseText.length > 500 ? responseText.substring(0, 500) + '...' : responseText;
    console.log(`📤 [tRPC] Response body:`, truncatedResponse);
  } catch (responseError) {
    console.log(`⚠️ [tRPC] Could not read response body:`, responseError);
  }

  // Add CORS headers to the response
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
};

export { handler as GET, handler as POST };
