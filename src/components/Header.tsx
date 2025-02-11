import React from "react";
import { useState } from "react";
import NavBar from "./NavBar";

export default function Header() {
  const [menu, setMenu] = useState<boolean>(false);

  return (
    <div>
      <h1>MovieApp</h1>
      <p onClick={() => setMenu((prevMenu) => !prevMenu)}>Menu</p>
      {menu && <NavBar menu={menu} setMenu={setMenu} />}
    </div>
  );
}
