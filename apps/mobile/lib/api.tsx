import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { type AppRouter } from "@paradigma/api";
import Constants from "expo-constants";
import { useState } from "react";
import superjson from "superjson";

import { authClient } from "./auth-client";

const transformer = superjson;
/**
 * A set of typesafe hooks for consuming your API.
 */
export const api = createTRPCReact<AppRouter>();
export { type RouterInputs, type RouterOutputs } from "@paradigma/api";

/**
 * Extend this function when going to production by
 * setting the baseUrl to your production API URL.
 */
export const getBaseUrl = () => {
  /**
   * Gets the IP address of your host-machine. If it cannot automatically find it,
   * you'll have to manually set it. NOTE: Port 3000 should work for most but confirm
   * you don't have anything else running on it, or you'd have to change it.
   *
   * **NOTE**: This is only for development. In production, you'll want to set the
   * baseUrl to your production API URL.
   */
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(":")[0];

  /*
  if (!localhost) {
    // return "https://turbo.t3.gg";
    throw new Error(
      "Failed to get localhost. Please point to your production server.",
    );
  }
  */

  const baseUrl = process.env.EXPO_PUBLIC_API_ENDPOINT
    ? process.env.EXPO_PUBLIC_API_ENDPOINT
    : `http://${localhost}:3000`;

  return baseUrl;
};

/**
 * A wrapper for your app that provides the TRPC context.
 * Use only in _app.tsx
 */
export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    api.createClient({
      transformer,
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
          colorMode: "ansi",
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          async headers() {
            const headers = new Map<string, string>();

            const cookies = await authClient.getCookie();
            if (cookies) {
              headers.set("Cookie", cookies);
            }

            console.log(`🔗 [Mobile API] Preparing headers for ${getBaseUrl()}/api/trpc`);

            try {
              // Check session for debugging
              const session = await authClient.getSession();
              console.log(`🔑 [Mobile API] Session:`, session ? 'Found session' : 'No session');

              if (session && 'data' in session && session.data) {
                console.log(`👤 [Mobile API] User ID: ${session.data.user?.id}`);
              }
            } catch (error) {
              console.log(`⚠️ [Mobile API] Error getting auth data:`, error);
            }

            // Add content type for mutations
            headers.set("Content-Type", "application/json");

            const headersObj = Object.fromEntries(headers);
            console.log(`📤 [Mobile API] Final headers:`, headersObj);

            return headersObj;
          },
        }),
      ],
    })
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  );
}
