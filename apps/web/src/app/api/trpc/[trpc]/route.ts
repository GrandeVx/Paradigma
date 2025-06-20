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
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

const handler = async (req: NextRequest) => {
  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req }),
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
            );
          }
        : undefined,
  });

  // Add CORS headers to the response
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
};

export { handler as GET, handler as POST };
