import 'server-only'; 
import { createTRPCProxyClient, loggerLink, httpBatchLink } from "@trpc/client";
import { cookies } from "next/headers";

import { type AppRouter } from "@paradigma/api";
import { getUrl } from "./shared";
import { transformer } from "@paradigma/api/trasformer";

export const api = createTRPCProxyClient<AppRouter>({
  transformer,
  links: [
    loggerLink({
      enabled: (op) =>
        process.env.NODE_ENV === "development" ||
        (op.direction === "down" && op.result instanceof Error),
    }),
    httpBatchLink({
      url: getUrl(),
      async headers()  {
        // console.log(
        //   "cookies ===",
        //   (await cookies()).toString(),
        // );
        return {
          cookie: (await cookies()).toString(),
          "x-trpc-source": "rsc",
        };
      },
    }),
  ],
});
