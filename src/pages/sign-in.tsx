import { GetServerSidePropsContext, NextPage } from "next";
import { getSession, signIn } from "next-auth/react";
import React from "react";
import Head from "next/head";
import Header from "../components/Header";
import { trackEvent } from "../utils/mixpanel";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);

  if (session?.user) {
    if (session.user.isOnboarded) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }
    return {
      redirect: {
        destination: "/profile/setup",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

const SignIn: NextPage = () => {
  const handleOnNortheasternSignInClick = (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    trackEvent("Sign In Attempt", { provider: "Northeastern" });
    signIn("azure-ad", {
      callbackUrl: "/",
    });
  };

  const handleOnGoogleSignInClick = (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    trackEvent("Sign In Attempt", { provider: "Google" });
    signIn("google", {
      callbackUrl: "/",
    });
  };

  return (
    <>
      <Head>
        <title>Sign In - NU Carpool</title>
      </Head>

      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="m-4 flex w-fit flex-col items-center justify-center space-y-4 rounded-2xl bg-white p-6 drop-shadow-lg">
          <Header signIn={true} />
          <button onClick={handleOnNortheasternSignInClick}>
            <div className="flex w-64 cursor-pointer items-center justify-center rounded bg-blue-500 px-4 py-3 text-center text-sm font-bold text-white shadow hover:bg-blue-700">
              Sign in with Northeastern!
            </div>
          </button>
          {process.env.NEXT_PUBLIC_ENV === "staging" && (
            <button onClick={handleOnGoogleSignInClick}>
              <div className="flex w-64 cursor-pointer items-center justify-center rounded bg-blue-500 px-4 py-3 text-center text-sm font-bold text-white shadow hover:bg-blue-700">
                Sign in via Google!
              </div>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default SignIn;
