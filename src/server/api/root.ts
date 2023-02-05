import { createTRPCRouter } from "@/server/api/trpc";
import { userRouter } from "@/server/api/routers/user";
import { providerRouter } from "@/server/api/routers/provider";
import { electricityRouter } from "@/server/api/routers/electricity";
import { consumptionRouter } from "@/server/api/routers/consumption";

export const appRouter = createTRPCRouter({
  user: userRouter,
  provider: providerRouter,
  elecricity: electricityRouter,
  consumption: consumptionRouter,
});

export type AppRouter = typeof appRouter;
