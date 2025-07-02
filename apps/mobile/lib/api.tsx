import React, { useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { type AppRouter } from "@paradigma/api";
import Constants from "expo-constants";
import superjson from "superjson";

import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { MMKV } from "react-native-mmkv"

import { authClient } from "./auth-client";
import { useAutoQuerySync } from "./cache-hooks";
import { Persister, PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

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
 * Persister for the query client - used to persist the query client in the MMKV storage
 */
const storage = new MMKV(); // MMKV storage for the query client

const clientStorage = {
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  getItem: (key: string) => {
    const value = storage.getString(key);
    return value === undefined ? null : value;
  },
  removeItem: (key: string) => {
    storage.delete(key);
  },
};

/**
 * A wrapper for your app that provides the TRPC context.
 * Use only in _app.tsx
 */
export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes (increased for better performance)
        cacheTime: 1000 * 60 * 60 * 2, // 2 hours (reduced from 24h)
        retry: (failureCount, error) => {
          // Don't retry on auth errors
          if (error && typeof error === 'object' && 'message' in error &&
            typeof error.message === 'string' && error.message.includes('UNAUTHORIZED')) {
            return false;
          }
          return failureCount < 2; // Reduced from 3 to 2
        },
        // Optimize background refetching
        refetchOnWindowFocus: false,
        refetchOnMount: false, // Reduce automatic refetching
        refetchOnReconnect: false, // Reduce automatic refetching
        // Network mode for better performance
        networkMode: 'online', // Changed from offlineFirst for better performance
        // Add deduplication
        structuralSharing: true,
      },
      mutations: {
        // Add mutation defaults for better performance
        cacheTime: 1000 * 60 * 5, // 5 minutes
        networkMode: 'online',
      },
    },
    // Add query deduplication and performance optimizations
    queryCache: undefined,
    mutationCache: undefined,
  }));

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
          // Add request timeout support for React Native
          fetch: (url, options) => {
            // Create AbortController for timeout functionality
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
              controller.abort();
            }, 30000); // 30 second timeout

            return fetch(url, {
              ...options,
              signal: controller.signal,
            }).finally(() => {
              clearTimeout(timeoutId);
            });
          },
          async headers() {
            const headers = new Map<string, string>();

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

            // @ts-expect-error - getCookie is not typed but exists 🧐
            const cookies = await authClient.getCookie();
            if (cookies) {
              headers.set("Cookie", cookies);
            }

            const headersObj = Object.fromEntries(headers);
            console.log(`📤 [Mobile API] Final headers:`, headersObj);

            return headersObj;
          },
        }),
      ],
    })
  );

  const persister = createSyncStoragePersister({ storage: clientStorage });

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      {/* Persist the query client in the MMKV storage */}
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: persister as Persister }}>
        <CacheProvider>{children}</CacheProvider>
      </PersistQueryClientProvider>
    </api.Provider>
  );
}

// Cache provider component to handle MMKV sync
function CacheProvider({ children }: { children: React.ReactNode }) {
  useAutoQuerySync();
  return <>{children}</>;
}
