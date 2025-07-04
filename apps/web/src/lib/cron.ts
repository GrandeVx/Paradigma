import * as cron from "node-cron";

export function initializeCronJobs() {
  // Run every day at 8:00 AM
  cron.schedule("0 8 * * *", async () => {
    console.log("🕐 Running daily recurring transactions processing at 8:00 AM");
    
    try {
      // Make internal API call to process recurring transactions
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/cron/recurring-transactions`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${process.env.CRON_SECRET}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Daily recurring transactions processing completed:", result);
    } catch (error) {
      console.error("❌ Error in daily recurring transactions processing:", error);
    }
  }, {
    timezone: "Europe/Rome", // Adjust timezone as needed
  });

  console.log("📅 Cron jobs initialized");
}