import { api } from "@/utils/api";
import Head from "next/head";

const ProviderPage = () => {
  const { data: providers } = api.provider.getProviders.useQuery();

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
        <div className="flex flex-col gap-3">
          {providers?.map((provider) => (
            <div className="rounded-xl bg-neutral-200 p-5" key={provider.id}>
              <h1 className="text-2xl font-bold">{provider.name}</h1>
              {provider.plans.length === 0 ? (
                <p>Ingen planer for tiden 😲</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {provider.plans.map((plan) => (
                    <div
                      className="rounded-xl bg-neutral-100 p-5"
                      key={plan.id}
                    >
                      <h1 className="text-xl font-bold">{plan.title}</h1>
                      <p>{plan.description}</p>
                      <p>{plan.price}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default ProviderPage;
