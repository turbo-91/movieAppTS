import React from "react";
import Head from "next/head";
import Header from "./Header";

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Head>
        <title>MovieApp</title>
      </Head>
      <Header />
      <main>{children}</main>
    </div>
  );
};

export default Layout;
