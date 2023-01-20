import { createTRPCRouter } from "@/server/api/trpc";
import { energyRouter } from "@/server/api/routers/energy";

export const appRouter = createTRPCRouter({
  energy: energyRouter,
});

export type AppRouter = typeof appRouter;
