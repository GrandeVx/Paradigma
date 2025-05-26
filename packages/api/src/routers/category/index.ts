import { createTRPCRouter } from "../../trpc";
import { queries } from "./queries";

export const categoryRouter = createTRPCRouter({
  ...queries,
}); 