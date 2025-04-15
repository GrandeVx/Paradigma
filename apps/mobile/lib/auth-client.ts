import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
 
export const authClient = createAuthClient({
    baseURL: process.env.EXPO_PUBLIC_BACKEND_URL, /* base url of your Better Auth backend. */
    plugins: [
        expoClient(
          {
            scheme: "paradigma-mobile",
            storagePrefix: "paradigma-mobile",
            storage: SecureStore,
        }
        )
    ]
});