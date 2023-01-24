import { createTRPCRouter } from "@/server/api/trpc";
import { userRouter } from "@/server/api/routers/user";
import { providerRouter } from "@/server/api/routers/provider";

export const appRouter = createTRPCRouter({
  user: userRouter,
  provider: providerRouter,
});

export type AppRouter = typeof appRouter;
