import { api } from "@/utils/api";
import { isErrorWithMessage } from "@/utils/error";
import type { Consumption, HourPrice } from "@prisma/client";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  YAxis,
  Label,
  XAxis,
  Legend,
  Tooltip,
  Bar,
  Line,
} from "recharts";

interface Props {
  date: Date;
  region: string;
}

const CompareGraph = ({ date, region }: Props) => {
  const [totalConsumption, setTotalConsumption] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [averagePrice, setAveragePrice] = useState(0);

  const { data: session } = useSession();
  const { data: consumption, refetch: refetchConsumption } =
    api.user.getConsumptionByDay.useQuery(
      { date },
      {
        enabled: false,
      }
    );
  const { data: electricityPrices, refetch: refetchElectricityPrices } =
    api.elecricity.getByDay.useQuery(
      {
        date,
        region: region as "NO1" | "NO2" | "NO3" | "NO4" | "NO5",
      },
      {
        enabled: false,
      }
    );

  useEffect(() => {
    void refetchElectricityPrices();

    if (session) {
      void refetchConsumption();
    }
  }, [refetchConsumption, refetchElectricityPrices, session, date, region]);

  useEffect(() => {
    if (consumption) {
      const total = consumption.reduce(
        (acc, curr) => acc + curr.consumption,
        0
      );

      setTotalConsumption(total);
    }

    if (electricityPrices) {
      if (isErrorWithMessage(electricityPrices)) {
        return;
      }

      if (!consumption) {
        return;
      }

      const totalSpotPrice = electricityPrices.reduce(
        (acc, curr) => acc + curr.price,
        0
      );
      setAveragePrice(totalSpotPrice / electricityPrices.length);

      const total = electricityPrices
        .map((hour, i) => {
          return hour.price * (consumption[i]?.consumption ?? 0);
        })
        .reduce((acc, curr) => acc + curr, 0);

      setTotalPrice(total);
    }
  }, [consumption, electricityPrices]);

  return (
    <>
      {isErrorWithMessage(electricityPrices) ? (
        <p>❗{electricityPrices.message}</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
              data={transformHourlyPrice(
                electricityPrices ?? [],
                consumption ?? []
              )}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              {session && (
                <YAxis yAxisId="right" orientation="right">
                  <Label value="Forbruk" angle={90} />
                </YAxis>
              )}

              <YAxis yAxisId="left" orientation="left">
                <Label value="Pris" angle={-90} position="insideLeft" />
              </YAxis>

              <XAxis dataKey="hour" interval={4} />

              <Legend />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "Pris") {
                    return `${value.toString()} øre/kWh`;
                  }

                  if (name === "Forbruk") {
                    return `${value.toString()} kWh`;
                  }

                  return value;
                }}
              />

              {session && (
                <Bar
                  yAxisId="right"
                  dataKey="consumption"
                  name="Forbruk"
                  fill="#8884d8"
                />
              )}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="price"
                name="Pris"
                stroke="#4ADE80"
                strokeWidth={3}
              />
            </ComposedChart>
          </ResponsiveContainer>
          {consumption && consumption.length <= 0 && (
            <p className="text-sm">
              ❗Du har ikke registrert forbruk for denne dagen.
            </p>
          )}
          {!session && (
            <p className="text-sm">
              ❗Logg inn for å også se forbruket ditt denne dagen.
            </p>
          )}
          {session && (
            <div>
              <p>
                Gjennomsnitts pris per time for denne dagen:{" "}
                <span className="font-bold">
                  kr {averagePrice.toFixed(2)}/kWh
                </span>
              </p>
              <p>
                Total forbruk denne dagen:{" "}
                <span className="font-bold">
                  {totalConsumption.toFixed(0)} kWh
                </span>
              </p>
              <p>
                Total pris denne dagen:{" "}
                <span className="font-bold">kr {totalPrice.toFixed(2)}</span>
              </p>
            </div>
          )}
        </>
      )}
    </>
  );
};

const transformHourlyPrice = (
  hourlyPrices: Array<HourPrice>,
  consumption: Array<Consumption>
) => {
  if (!hourlyPrices) {
    return [];
  }

  return hourlyPrices.map((hour, i) => ({
    hour: format(new Date(hour.timeStart), "'kl' HH:mm"),
    price: Math.trunc(hour.price * 100),
    consumption: consumption ? consumption[i]?.consumption : null,
  }));
};

export default CompareGraph;
