import Link from "next/link";
import React from "react";

export default function NavBar() {
  return (
    <div>
      <Link href="/">home</Link>
      <Link href="/search">suche</Link>
      <Link href="/login">login</Link>
    </div>
  );
}
