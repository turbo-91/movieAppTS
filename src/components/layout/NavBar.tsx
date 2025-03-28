import Link from "next/link";
import React from "react";
import { useSession } from "next-auth/react";

export default function NavBar() {
  const { data: session, status } = useSession();

  return (
    <div>
      <Link href="/">home</Link>
      {status === "authenticated" && <Link href="/search">suche</Link>}
      <Link href="/login">login</Link>
    </div>
  );
}
