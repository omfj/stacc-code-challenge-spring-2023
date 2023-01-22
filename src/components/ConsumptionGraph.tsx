import { api } from "@/utils/api";
import type { ErrorWithMessage } from "@/utils/error";
import { isErrorWithMessage } from "@/utils/error";
import { transformHourlyPrice } from "@/utils/prices";
import type { HourlyPrice } from "@/utils/schemas";
import { hourlyPriceSchema } from "@/utils/schemas";
import axios from "axios";
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

const ConsumptionGraph = ({ date, region }: Props) => {
  const { data: session } = useSession();
  const [electricityPrices, setElectricityPrices] = useState<
    Array<HourlyPrice> | ErrorWithMessage
  >([]);

  const { data: consumption, refetch } = api.user.getConsumptionByDay.useQuery(
    { date },
    {
      enabled: false,
    }
  );

  useEffect(() => {
    const fetchElectricityPrices = async () => {
      const year = format(date, "yyyy");
      const month = format(date, "MM");
      const day = format(date, "dd");

      const { data, status } = await axios.get<Array<HourlyPrice>>(
        `https://www.hvakosterstrommen.no/api/v1/prices/${year}/${month}-${day}_${region}.json`,
        {
          validateStatus: (status) => status < 500,
        }
      );

      switch (status) {
        case 200:
          const parsedHourlyPrice = hourlyPriceSchema.array().safeParse(data);

          if (!parsedHourlyPrice.success) {
            setElectricityPrices({
              message: "Noe gikk feil.",
            });
            return;
          }

          setElectricityPrices(parsedHourlyPrice.data);
          break;
        case 404:
          setElectricityPrices({
            message: "Ingen priser for denne dagen.",
          });
          break;
        default:
          setElectricityPrices({
            message: "Noe gikk feil.",
          });
          break;
      }
    };

    void fetchElectricityPrices();
    if (session) {
      void refetch();
    }
  }, [date, refetch, region, session]);

  return (
    <>
      {isErrorWithMessage(electricityPrices) ? (
        <p>{electricityPrices.message}</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
              data={transformHourlyPrice(electricityPrices, consumption ?? [])}
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

export default ConsumptionGraph;
