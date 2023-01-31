import { createTRPCRouter } from "@/server/api/trpc";
import { userRouter } from "@/server/api/routers/user";
import { providerRouter } from "@/server/api/routers/provider";
import { electricityRouter } from "@/server/api/routers/electricity";

export const appRouter = createTRPCRouter({
  user: userRouter,
  provider: providerRouter,
  elecricity: electricityRouter,
});

export type AppRouter = typeof appRouter;
