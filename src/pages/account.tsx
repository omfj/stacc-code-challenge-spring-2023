import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Profile from "@/components/Profile";
import Head from "next/head";

const AccountPage = () => {
  const router = useRouter();
  const { data: session } = useSession();

  if (session === undefined) {
    return null;
  }

  if (!session) {
    void router.push("/");
    return null;
  }

  return (
    <>
      <Head>
        <title>Strømsta — Konto</title>
      </Head>
      <Profile session={session} />;
    </>
  );
};

export default AccountPage;
