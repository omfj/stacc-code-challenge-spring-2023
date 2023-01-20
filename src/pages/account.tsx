import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Profile from "@/components/Profile";

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

  return <Profile session={session} />;
};

export default AccountPage;
