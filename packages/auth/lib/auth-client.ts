import { createAuthClient } from "better-auth/react"

export const { signIn, signUp, useSession , signOut } = createAuthClient()


 
export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_WEBSITE_URL, /* base url of your Better Auth backend. */ 
});
