import Tag from "@/components/Tag";
import { api } from "@/utils/api";
import type { Plan, Provider } from "@prisma/client";
import { PriceRegion } from "@prisma/client";
import { PriceModel } from "@prisma/client";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect, useState } from "react";
import { isErrorWithMessage } from "@/utils/error";
import { calculateCost } from "@/lib/provider";
import { RegionNames } from "@/utils/schemas";

interface Props {
  providers: Array<
    Provider & {
      plans: Array<Plan>;
    }
  >;
}

const ProviderPage = ({ providers }: Props) => {
  const [region, setRegion] = useState("NO1");

  const { data: session } = useSession();
  const { data: consumption, refetch } =
    api.user.getLastNDaysOfConsumption.useQuery(
      {
        days: 30,
      },
      {
        enabled: false,
      }
    );
  const { data: electricityPrices } =
    api.elecricity.getPricesForLastNDays.useQuery({
      days: 30,
      region: region as PriceRegion,
    });

  useEffect(() => {
    if (session) {
      void refetch();
    }
  }, [refetch, session]);

  return (
    <>
      <Head>
        <title>Strømsta — Leverandører</title>
      </Head>

      {providers?.length === 0 ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Ingen leverandører for tiden 😲
          </h1>
          <p>Kom tilbake senere</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <p className="text-xl font-bold">Vis priser for:</p>
            <select
              className="mx-2 rounded-md py-1"
              onChange={(e) => setRegion(e.target.value)}
            >
              {Object.entries(RegionNames).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-3">
            {providers?.map((provider) => (
              <div key={provider.id}>
                <h1 className="mb-3 text-2xl font-bold">{provider.name}</h1>
                {provider.plans.length === 0 ? (
                  <p>Ingen planer for tiden 😲</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {provider.plans.map((plan) => {
                      const feeText = plan.fee
                        ? `${
                            plan.PriceModel === PriceModel.SPOT
                              ? "Påslag"
                              : "Strømpris"
                          }: ${plan.fee} øre/kWh`
                        : "Ingen påslag";
                      const priceText = plan.price
                        ? `Måndesbeløp: ${plan.price} kr`
                        : "Ingen månedsbeløp";
                      const periodText = plan.period
                        ? `${plan.period} mnd bindingstid`
                        : "Ingen bindingstid";

                      const estimatedCost = calculateCost(
                        consumption ?? [],
                        electricityPrices ?? [],
                        plan
                      );

                      return (
                        <div
                          className="flex flex-col gap-3 rounded-xl bg-neutral-200 p-5"
                          key={plan.id}
                        >
                          <h1 className="mb-1 text-xl font-bold">
                            {plan.title}
                          </h1>
                          <p>{plan.description}</p>

                          <div className="flex flex-wrap gap-2">
                            <Tag size="small">
                              <p>{feeText}</p>
                            </Tag>
                            <Tag size="small">
                              <p>{periodText}</p>
                            </Tag>
                            <Tag size="small">
                              <p>{priceText}</p>
                            </Tag>
                          </div>

                          {session && !isErrorWithMessage(estimatedCost) && (
                            <p>
                              Pris siste 30 dager:{" "}
                              <span className="font-bold">
                                {estimatedCost.toFixed(2)} kr
                              </span>
                            </p>
                          )}
                          {session && isErrorWithMessage(estimatedCost) && (
                            <p>{estimatedCost.message}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export const getServerSideProps = async () => {
  const providers = await prisma?.provider.findMany({
    include: {
      plans: true,
    },
  });

  return {
    props: {
      providers: providers ?? [],
    },
  };
};

export default ProviderPage;
