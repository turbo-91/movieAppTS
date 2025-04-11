import React from "react";
import Head from "next/head";
import Header from "./Header";

const Layout = ({ children }) => {
  return (
    <>
      <Head>
        <title>Film.Finder</title>
      </Head>
      <Header />
      <main>{children}</main>
    </>
  );
};

export default Layout;
