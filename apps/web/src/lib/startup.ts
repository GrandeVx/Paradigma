import { initializeCronJobs } from "./cron";

let initialized = false;

export function initializeApp() {
  if (initialized) {
    return;
  }

  // Initialize cron jobs only in production or when explicitly enabled
  if (process.env.NODE_ENV === "production" || process.env.ENABLE_CRON === "true") {
    console.log("🚀 Initializing application...");
    initializeCronJobs();
    console.log("✅ Application initialized successfully");
  } else {
    console.log("⚠️ Cron jobs disabled in development. Set ENABLE_CRON=true to enable.");
  }

  initialized = true;
}