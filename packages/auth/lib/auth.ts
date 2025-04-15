import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@paradigma/db";
import { nextCookies } from "better-auth/next-js";
import { expo } from "@better-auth/expo";
 
export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: { 
        enabled: true, 
    }, 
    trustedOrigins: ["paradigma-mobile://"],
  plugins: [nextCookies(),expo()],
});
