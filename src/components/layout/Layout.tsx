import React from "react";
import Head from "next/head";
import Header from "./Header";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const Layout = ({ children }) => {
  return (
    <div className={montserrat.variable}>
      <Head>
        <title>MovieApp</title>
      </Head>
      <Header />
      <main>{children}</main>
    </div>
  );
};

export default Layout;
