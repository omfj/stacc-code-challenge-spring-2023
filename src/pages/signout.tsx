import { signOut } from "next-auth/react";
import Button from "@/components/Button";

export default function SignIn() {
  return (
    <>
      <h1 className="mb-10 text-center text-3xl font-bold">
        Er du sikker på at du vil logge ut?
      </h1>
      <div className="flex flex-col justify-center gap-3">
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
    </>
  );
}
