import { createTRPCRouter } from "../../trpc";
import { queries } from "./queries";

export const utilRouter = createTRPCRouter({
  ...queries,
});
