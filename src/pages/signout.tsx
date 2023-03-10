import { signOut } from "next-auth/react";
import Button from "@/components/Button";
import Head from "next/head";

export default function SignIn() {
  return (
    <>
      <Head>
        <title>Strømsta — Logg ut</title>
      </Head>
      <section>
        <h1 className="mb-10 text-center text-3xl font-bold">
          Er du sikker på at du vil logge ut?
        </h1>
        <div className="mx-auto w-fit">
          <Button
            size="large"
            onClick={() =>
              void signOut({
                callbackUrl: "/",
              })
            }
          >
            Logg ut
          </Button>
        </div>
      </section>
    </>
  );
}
