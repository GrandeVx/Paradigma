import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import { emailOTPClient } from "better-auth/client/plugins";
import * as SecureStore from "expo-secure-store";

// Use base URL since API routes are now excluded from i18n middleware
const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
console.log("🔐 [Auth Client] Backend URL:", backendUrl);
console.log("🔧 [Auth Client] EXPO_PUBLIC_BACKEND_URL:", process.env.EXPO_PUBLIC_BACKEND_URL);
console.log("🌐 [Auth Client] Full auth URL will be:", `${backendUrl}/api/auth`);

if (!backendUrl) {
  console.error("❌ [Auth Client] EXPO_PUBLIC_BACKEND_URL is not set!");
} else {
  console.log("✅ [Auth Client] Backend URL is configured correctly");
}
 
export const authClient = createAuthClient({
    baseURL: backendUrl || "http://localhost:3000", /* base url of your Better Auth backend. */
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