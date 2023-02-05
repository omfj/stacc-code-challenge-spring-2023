import Tag from "@/components/Tag";
import { api } from "@/utils/api";
import { isErrorWithMessage } from "@/utils/error";
import { PriceModel } from "@prisma/client";
import Head from "next/head";

const ProviderPage = () => {
  const { data: providers } = api.provider.all.useQuery();

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

                          {plan.estimatedPrice &&
                            !isErrorWithMessage(plan.estimatedPrice) && (
                              <p>
                                Pris siste 30 dager:{" "}
                                <span className="font-bold">
                                  {plan.estimatedPrice.toFixed(2)} kr
                                </span>
                              </p>
                            )}
                          {isErrorWithMessage(plan.estimatedPrice) && (
                            <p>
                              <span className="font-bold">
                                {plan.estimatedPrice.message}
                              </span>
                            </p>
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

export default ProviderPage;
