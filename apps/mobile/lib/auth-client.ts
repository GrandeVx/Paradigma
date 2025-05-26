import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import { emailOTPClient } from "better-auth/client/plugins";
import * as SecureStore from "expo-secure-store";
 
export const authClient = createAuthClient({
    baseURL: process.env.EXPO_PUBLIC_BACKEND_URL, /* base url of your Better Auth backend. */
    plugins: [
                emailOTPClient(),
        expoClient(
          {
            scheme: "balance",
            storagePrefix: "balance",
            storage: SecureStore,
        }
        ),

    ]
});