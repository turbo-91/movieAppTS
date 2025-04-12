import React from "react";
import { useState } from "react";
import NavBar from "./NavBar";
import styled from "styled-components";

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 0.2rem solid white;
  color: white;
  font-weight: 100;
  width: 100%;
  height: 15vh;
  margin-top: 2vh;
`;

const AppTitle = styled.h1`
  font-size: 6rem;
  font-weight: var(--font-weight-light);
  margin: 0;
  padding: 0.7rem;
`;

const Menu = styled.h3`
  font-size: 1.8rem;
  font-weight: var(--font-weight-light);
  margin-bottom: 0;
  padding: 0.7rem;
`;

export default function Header() {
  const [menu, setMenu] = useState<boolean>(false);

  return (
    <HeaderContainer>
      <AppTitle>Film.Finder</AppTitle>
      {!menu && (
        <Menu onClick={() => setMenu((prevMenu) => !prevMenu)}>Menü</Menu>
      )}
      {menu && <NavBar menu={menu} setMenu={setMenu} />}
    </HeaderContainer>
  );
}
