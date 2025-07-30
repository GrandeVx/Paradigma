import { userRouter } from "./routers/user";
import { utilRouter } from "./routers/util";
import { createTRPCRouter } from "./trpc";
import { accountRouter } from "./routers/account";
import { transactionRouter } from "./routers/transaction";
import { categoryRouter } from "./routers/category";
import { budgetRouter } from "./routers/budget";
import { recurringRuleRouter } from "./routers/recurringRule";
import { subscriptionRouter } from "./routers/subscription";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  util: utilRouter,
  account: accountRouter,
  transaction: transactionRouter,
  category: categoryRouter,
  budget: budgetRouter,
  recurringRule: recurringRuleRouter,
  subscription: subscriptionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
