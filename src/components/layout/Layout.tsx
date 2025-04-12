import React, { ReactNode } from "react";
import Head from "next/head";
import Header from "./Header";
import { IMovie } from "@/db/models/Movie";

export interface LayoutProps {
  setSelectedMovie: (movie: IMovie | null) => void;
  children: ReactNode;
}

const Layout = (props: Readonly<LayoutProps>) => {
  const { setSelectedMovie, children } = props;
  return (
    <>
      <Head>
        <title>Film.Finder</title>
      </Head>
      <Header setSelectedMovie={setSelectedMovie} />
      <main>{children}</main>
    </>
  );
};

export default Layout;
