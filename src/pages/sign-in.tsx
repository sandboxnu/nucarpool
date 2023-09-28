import { GetServerSidePropsContext, NextPage } from "next";
import { getSession, signIn } from "next-auth/react";
import React from "react";
import Head from "next/head";
import Header from "../components/Header";

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
        destination: "/profile",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

const SignIn: NextPage = () => {
  const handleOnclick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    signIn("cognito", {
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
          <Header />
          <button onClick={handleOnclick}>
            <div className="flex w-64 cursor-pointer items-center justify-start rounded bg-blue-500 px-4 py-3 text-sm font-bold text-white shadow hover:bg-blue-700">
              <svg
                viewBox="0 0 24 24"
                className="mr-3 h-5 w-6 fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
              </svg>
              <span className="block h-6 w-1 border-l border-white"></span>
              <span className="pl-3">Sign up with Google</span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
  // return (
  //   <>
  //     <Head>
  //       <title>Sign In - NU Carpool</title>
  //     </Head>

  //     <div className="flex min-h-screen items-center justify-center bg-gray-100">
  //       <div className="rounded-2xl w-fit bg-white flex flex-col justify-center items-center p-6 m-4 space-y-4 drop-shadow-lg">
  //         <Header />
  //         <button onClick={handleOnclick}>
  //           <div className="bg-blue-500 text-white hover:bg-blue-700 shadow font-bold text-sm py-3 px-4 rounded flex justify-start items-center cursor-pointer w-64">
  //             <svg
  //               viewBox="0 0 24 24"
  //               className="fill-current mr-3 w-6 h-5"
  //               xmlns="http://www.w3.org/2000/svg"
  //             >
  //               <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
  //             </svg>
  //             <span className="border-l border-white h-6 w-1 block"></span>
  //             <span className="pl-3">Sign up with Google</span>
  //           </div>
  //         </button>
  //       </div>
  //     </div>
  //   </>
  // );
};

export default SignIn;
