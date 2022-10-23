import { NextPage } from "next";
import { useSession, getSession } from "next-auth/react";
import { useRouter } from "next/router";
import Spinner from "../components/Spinner";


/**
 * Returns either the input page, a loading screen, or redirects to a login page,
 * all based on the status of the session. 
 * 
 * Usage: wrap page element with this function when exporting, e.g. 
 * `export default ProtectedPage(Home);`
 * 
 * @param page The page the user is trying to reach
 * @returns the appropriate page for the user given the current session
 */
export default function ProtectedPage(Page: NextPage) { 
  const Callback = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

 
    if (status === "loading") {
      return <Spinner />;
    }

    if (status === "unauthenticated") {
      router.push("/sign-in");
      return <Spinner />;
    }

    return <Page />;
  }
  Callback.displayName = Page.displayName;
  return Callback;
}

