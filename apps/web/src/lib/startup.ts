// Application startup utilities
// Note: Cron jobs are now handled by external scheduler (deploy platform)

export function logApplicationStart() {
  console.log("🚀 Balance application started");
  console.log("📅 Recurring transactions are processed via external scheduler");
  console.log("🔗 Endpoint: /api/cron/recurring-transactions");
}