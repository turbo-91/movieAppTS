import Link from "next/link";
import React from "react";

interface NavBarProps {
  menu: boolean;
  setMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function NavBar({ menu, setMenu }: NavBarProps) {
  return (
    <div>
      <Link href="/">home</Link>
      <Link href="/login">login</Link>
    </div>
  );
}
