import { createTRPCRouter } from "../../trpc";
import { queries } from "./queries";
import { mutations } from "./mutations";

export const groupsRouter = createTRPCRouter({
  ...queries,
  ...mutations,
});