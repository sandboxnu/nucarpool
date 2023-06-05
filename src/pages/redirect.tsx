import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { trpc } from "../utils/trpc";
import ProtectedPage from "../utils/auth";
import Spinner from "../components/Spinner";

const Redirect: NextPage = () => {
  const router = useRouter();
  const { data: user } = trpc.useQuery(["user.me"], { refetchOnMount: true });

  useEffect(() => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    if (user.isOnboarded) {
      router.push("/");
    } else {
      router.push("/profile");
    }
  }, [user]);

  return <Spinner />;
};

export default ProtectedPage(Redirect);
