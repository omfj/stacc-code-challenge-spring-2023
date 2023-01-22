import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const energyRouter = createTRPCRouter({
  /**
   * Get all the energy providers
   */
  getProviders: publicProcedure.query(() => {
    return "Hey";
  }),
});
