import { createAuthClient } from "better-auth/react"
import { emailOTPClient } from "better-auth/client/plugins"

export const { signIn, signUp, useSession, signOut, emailOtp } = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_WEBSITE_URL, /* base url of your Better Auth backend. */
    plugins: [emailOTPClient()]
})

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_WEBSITE_URL, /* base url of your Better Auth backend. */
    plugins: [emailOTPClient()]
});
