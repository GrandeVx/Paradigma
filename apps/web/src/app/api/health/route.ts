import { NextResponse } from "next/server";
import { prismaBase as db } from "@paradigma/db";

export async function GET() {
  const healthCheck = {
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "balance-web",
    database: "unknown",
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasDbUrl: !!process.env.DATABASE_URL,
      hasEmailConfig: !!(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD),
      hasBetterAuthSecret: !!process.env.BETTER_AUTH_SECRET,
      betterAuthUrl: process.env.BETTER_AUTH_URL
    }
  };

  try {
    // Test database connectivity
    await db.$queryRaw`SELECT 1`;
    healthCheck.database = "connected";
    console.log("✅ [Health Check] Database connection successful");
  } catch (error) {
    healthCheck.database = "error";
    healthCheck.status = "degraded";
    console.error("❌ [Health Check] Database connection failed:", error);
  }

  const status = healthCheck.status === "ok" ? 200 : 500;
  
  return NextResponse.json(healthCheck, { status });
} 