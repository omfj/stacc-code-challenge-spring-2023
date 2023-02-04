import type { ErrorWithMessage } from "@/utils/error";
import { isErrorWithMessage } from "@/utils/error";
import type { Consumption, HourPrice, Plan } from "@prisma/client";
import { PriceModel } from "@prisma/client";

export const calculateCost = (
  consumption: Array<Consumption>,
  electricityPrices: Array<HourPrice>,
  plan: Plan
): ErrorWithMessage | number => {
  // Check if it is 30 days of consumption
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
      return calculateVariablePrice(plan, electricityPrices, consumption);
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

const calculateVariablePrice = (
  plan: Plan,
  electricityPrices: Array<HourPrice>,
  consumption: Array<Consumption>
) => {
  const total = electricityPrices
    .map((hour, i) => {
      return (
        (hour.price * (consumption[i]?.consumption ?? 0)) / 100 + plan.price
      );
    })
    .reduce((acc, curr) => acc + curr, 0);

  return total;
};
