import type { AppProps } from "next/app";
import Layout from "@/components/layout/Layout";
import { SessionProvider } from "next-auth/react";
import GlobalStyle from "@/styles/GlobalStyles";
import { useState } from "react";
import { IMovie } from "@/db/models/Movie";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const [selectedMovie, setSelectedMovie] = useState<IMovie | null>(null);

  return (
    <SessionProvider session={session}>
      <GlobalStyle />
      <Layout setSelectedMovie={setSelectedMovie}>
        <Component
          {...pageProps}
          selectedMovie={selectedMovie}
          setSelectedMovie={setSelectedMovie}
        />
      </Layout>
    </SessionProvider>
  );
}
