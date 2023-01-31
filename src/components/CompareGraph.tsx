import { api } from "@/utils/api";
import { isErrorWithMessage } from "@/utils/error";
import type { Consumption, HourPrice } from "@prisma/client";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
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
