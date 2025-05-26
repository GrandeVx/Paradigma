import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins"
// 
import { prismaBase as db } from "@paradigma/db";
import { nextCookies } from "better-auth/next-js";
import { expo } from "@better-auth/expo";
import nodemailer from 'nodemailer';
 
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
            moneyAccounts: {
                type: "string[]",
                required: false,
                nullable: true,
            },
            recurringRules: {
                type: "string[]",
                required: false,
                nullable: true,
            },
            transactions: {
                type: "string[]",
                required: false,
                nullable: true,
            },
            goals: {
                type: "string[]",
                required: false,
                nullable: true,
            },
            budgets: {
                type: "string[]",
                required: false,
                nullable: true,
            }
        
        }
    },
    database: prismaAdapter(db, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: { 
        enabled: true, 
    }, 
    trustedOrigins: ["balance://"],
  plugins: [nextCookies(),expo(), emailOTP(
    {
        async sendVerificationOTP({ email, otp, type}) { 
            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: `Verification Code (${type})`,
                text: `Your verification code is ${otp}`
            });
        }
    }
  )],
});
