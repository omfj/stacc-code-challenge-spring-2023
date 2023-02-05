import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import type { ErrorWithMessage } from "@/utils/error";
import type { Consumption, HourPrice, Plan } from "@prisma/client";
import { PriceModel } from "@prisma/client";
import { sub } from "date-fns";
import { getConsumptionByDay } from "./consumption";
import { getElectricityPrices } from "./electricity";

export const providerRouter = createTRPCRouter({
  /**
   * Get all the energy providers
   *
   * If the user is logged in, the estimated price will be calculated.
   */
  all: publicProcedure.query(async ({ ctx }) => {
    const providers = await ctx.prisma.provider.findMany({
      include: {
        plans: true,
      },
    });

    const providersNoPrice = providers.map((provider) => {
      return {
        ...provider,
        plans: provider.plans.map((plan) => {
          return {
            ...plan,
            estimatedPrice: null,
          };
        }),
      };
    });

    if (!ctx.session?.user?.id) {
      return providersNoPrice;
    }

    const profile = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
    });

    if (!profile) {
      return providersNoPrice;
    }

    const electricityPriceArray = [];
    for (let i = 0; i < 30; i++) {
      const date = sub(new Date(), { days: i });
      electricityPriceArray.push(
        getElectricityPrices(date, profile.region, ctx.prisma)
      );
    }
    const prices = (await Promise.all(electricityPriceArray)).flat();

    const consumptionArray = [];
    for (let i = 0; i < 30; i++) {
      const date = sub(new Date(), { days: i });
      consumptionArray.push(
        getConsumptionByDay(ctx.prisma, ctx.session.user.id, date)
      );
    }
    const consumption = (await Promise.all(consumptionArray)).flat();

    const providersWithPlans = providers.map((provider) => {
      const plans = provider.plans.map((plan) => {
        return {
          ...plan,
          estimatedPrice: calculateCost(plan, prices, consumption),
        };
      });

      return {
        ...provider,
        plans,
      };
    });

    return providersWithPlans;
  }),
});

export const calculateCost = (
  plan: Plan,
  electricityPrices: Array<HourPrice>,
  consumption: Array<Consumption>
): ErrorWithMessage | number => {
  if (consumption.length !== 30 * 24) {
    return {
      message:
        "Ikke nok dager med forbruk. Gå på konto-siden og legg til forbruk",
    };
  }

  switch (plan.PriceModel) {
    case PriceModel.SPOT:
      return calculateSpotPrice(plan, electricityPrices, consumption);
    case PriceModel.FIXED:
      return calculateFixedPrice(plan, consumption);
    case PriceModel.VARIABLE:
      return calculateVariablePrice();
  }
};

const calculateSpotPrice = (
  plan: Plan,
  electricityPrices: Array<HourPrice>,
  consumption: Array<Consumption>
) => {
  const total = electricityPrices
    .map((hour, i) => {
      return hour.price * (consumption[i]?.consumption ?? 0);
    })
    .reduce((acc, curr) => acc + curr, 0);

  return total + plan.fee;
};

const calculateFixedPrice = (plan: Plan, consumption: Array<Consumption>) => {
  const totalConsumption = consumption.reduce(
    (acc, curr) => acc + curr.consumption,
    0
  );

  return totalConsumption * (plan.fee / 100) + plan.price;
};

const calculateVariablePrice = () =>
  // plan: Plan,
  // electricityPrices: Array<HourPrice>,
  // consumption: Array<Consumption>
  {
    // const total = electricityPrices
    //   .map((hour, i) => {
    //     return (
    //       (hour.price * (consumption[i]?.consumption ?? 0)) / 100 + plan.price
    //     );
    //   })
    //   .reduce((acc, curr) => acc + curr, 0);

    return {
      message: "Du burde ikke",
    };
  };
