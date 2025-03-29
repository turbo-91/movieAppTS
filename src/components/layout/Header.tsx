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
  margin: 0;
  padding: 0;
`;

const AppTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: var(--font-weight-semibold);
  margin: 0;
  padding: 0.7rem;
`;

const Menu = styled.h3`
  font-size: 1rem;
  font-weight: var(--font-weight-light);
  margin-bottom: 0;
  padding: 0.7rem;
`;

export default function Header() {
  const [menu, setMenu] = useState<boolean>(false);

  return (
    <HeaderContainer>
      <AppTitle>Movie App</AppTitle>
      <Menu onClick={() => setMenu((prevMenu) => !prevMenu)}>Menü</Menu>
      {menu && <NavBar />}
    </HeaderContainer>
  );
}
