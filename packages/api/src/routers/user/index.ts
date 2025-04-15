import { createTRPCRouter } from "../../trpc";
import { queries } from "./queries";
import { mutations } from "./mutations";

export const userRouter = createTRPCRouter({
  ...queries,
  ...mutations,
});
