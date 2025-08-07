import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins"
// 
import { prismaBase as db } from "@paradigma/db";
import { nextCookies } from "better-auth/next-js";
import { expo } from "@better-auth/expo";
import nodemailer from 'nodemailer';

// Log initialization
console.log("🚀 [BetterAuth] Initializing with config:", {
    databaseUrl: process.env.DATABASE_URL ? "Connected" : "Missing",
    emailHost: process.env.EMAIL_HOST || "Missing",
    emailUser: process.env.EMAIL_USER || "Missing",
    hasEmailPassword: !!process.env.EMAIL_PASSWORD,
    betterAuthSecret: process.env.BETTER_AUTH_SECRET ? "Set" : "Missing",
    betterAuthUrl: process.env.BETTER_AUTH_URL || "Missing",
    googleClientId: process.env.GOOGLE_CLIENT_ID ? "Set" : "Missing",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? "Set" : "Missing",
    appleClientId: process.env.APPLE_CLIENT_ID ? "Set" : "Missing",
    appleClientSecret: process.env.APPLE_CLIENT_SECRET ? "Set" : "Missing",
});

export const auth = betterAuth({
    user: {
        modelName: "User",
        fields: {
            email: "email",
            emailVerified: "emailVerified",
            name: "name",
            image: "image",
        },
        additionalFields: {
            /**
             * Here you will define all the fields that you want to find in the User Session 
             * For the documentation visit: https://www.better-auth.com/docs/reference/options#user
             * Remember to use the correct name of the field in the database
             */
            language: {
                type: "string",
            },
            notifications: {
                type: "boolean",
                defaultValue: true,
            },
            notificationToken: {
                type: "string",
                required: false,
                nullable: true,
            },
            isDeleted: {
                type: "boolean",
                defaultValue: false,
            },
            deletedAt: {
                type: "date",
                required: false,
                nullable: true,
            },
        }
    },
    database: prismaAdapter(db, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
        apple: {
            clientId: process.env.APPLE_CLIENT_ID!,
            clientSecret: process.env.APPLE_CLIENT_SECRET!,
        },
    },
    trustedOrigins: ["balance://", "https://appleid.apple.com"],
    plugins: [nextCookies(), expo(), emailOTP(
        {
            generateOTP: ({ email }) => {
                const isDemoMode = process.env.EXPO_PUBLIC_DEMO_MODE_ENABLED === 'true';
                const isDemoAccount = email === 'test@paradigma.com';

                if (isDemoMode && isDemoAccount) {
                    console.log('🎭 [BetterAuth] Generating fixed OTP for demo account');
                    return '123456'; // Fixed OTP for demo account
                }

                // Default random OTP generation for regular users
                const randomOtp = Math.random().toString(36).substring(2, 8).toUpperCase();
                console.log('🔐 [BetterAuth] Generated random OTP for regular user');
                return randomOtp;
            },
            async sendVerificationOTP({ email, otp, type }) {
                const isDemoMode = process.env.EXPO_PUBLIC_DEMO_MODE_ENABLED === 'true';
                const isDemoAccount = email === 'test@paradigma.com';

                console.log("🔐 [BetterAuth] Sending verification OTP:", {
                    email,
                    otp,
                    type,
                    isDemoMode,
                    isDemoAccount,
                    emailHost: process.env.EMAIL_HOST,
                    emailUser: process.env.EMAIL_USER,
                    hasPassword: !!process.env.EMAIL_PASSWORD
                });

                // Demo mode: Skip email sending for demo account
                if (isDemoMode && isDemoAccount) {
                    console.log("🎭 [BetterAuth] Demo mode enabled - Skipping email for demo account");
                    console.log("🎭 [BetterAuth] Use fixed OTP: 123456");
                    return; // Don't send email, use fixed OTP
                }

                try {
                    const transporter = nodemailer.createTransport({
                        host: process.env.EMAIL_HOST,
                        port: 587,
                        secure: false,
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASSWORD
                        }
                    });

                    const result = await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: email,
                        subject: `Verification Code (${type})`,
                        text: `Your verification code is ${otp}`
                    });

                    console.log("✅ [BetterAuth] Email sent successfully:", result);
                } catch (error) {
                    console.error("❌ [BetterAuth] Email sending failed:", error);
                    throw error;
                }
            }
        }
    )],
});
