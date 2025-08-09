import { userRouter } from "./routers/user";
import { utilRouter } from "./routers/util";
import { groupsRouter } from "./routers/groups";
import { postsRouter } from "./routers/posts";
import { likesRouter } from "./routers/likes";
import { commentsRouter } from "./routers/comments";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  util: utilRouter,
  groups: groupsRouter,
  posts: postsRouter,
  likes: likesRouter,
  comments: commentsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;