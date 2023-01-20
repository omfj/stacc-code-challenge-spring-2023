import type { Provider } from "next-auth/providers";
import { getProviders, signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Button from "@/components/Button";

interface Props {
  providers: Array<Provider>;
}

export default function SignIn({ providers }: Props) {
  const router = useRouter();
  const { data: session } = useSession();

  if (session) {
    void router.push("/");
  }

  return (
    <>
      <h1 className="mb-10 text-center text-3xl font-bold">
        Velg en måte å logge inn på
      </h1>
      <div className="flex flex-col justify-center gap-3">
        {Object.values(providers).map((provider) => (
          <div className="mx-auto" key={provider.name}>
            <Button size="large" onClick={() => void signIn(provider.id)}>
              Logg inn med {provider.name}
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}

export async function getServerSideProps() {
  const providers = await getProviders();

  return {
    props: { providers },
  };
}
