import { createTRPCRouter } from "../../trpc";
import { queries, getDailyTransactions, getCategoryTransactions, getBudgetInfo } from "./queries";
import { mutations } from "./mutations";

export const transactionRouter = createTRPCRouter({
  ...queries,
  ...mutations,
  getDailyTransactions,
  getCategoryTransactions,
  getBudgetInfo,
}); 