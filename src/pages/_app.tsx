import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Session } from "next-auth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SessionProvider } from "next-auth/react";
import Head from "next/head";
import { trpc } from "../utils/trpc";

export function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session }>) {
  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Lato&display=swap"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <SessionProvider session={session} refetchOnWindowFocus={false}>
        <Component {...pageProps} />
        <ToastContainer />
      </SessionProvider>
    </>
  );
}

export default trpc.withTRPC(MyApp);
