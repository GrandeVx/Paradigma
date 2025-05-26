import { createTRPCRouter } from "../../trpc";
import { queries } from "./queries";
import { mutations } from "./mutations";

export const recurringRuleRouter = createTRPCRouter({
  ...queries,
  ...mutations,
}); 