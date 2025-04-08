import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import styled from "styled-components";

const NavContainer = styled.nav`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 0.7rem;
  padding: 0.7rem;
`;

const NavButton = styled.button`
  all: unset;
  cursor: pointer;
  font-size: 1.8rem;
`;

const CloseButton = styled.button`
  all: unset;
  cursor: pointer;
  font-size: 1.2rem;
  margin-bottom: 3px;
`;

export interface NavBarProps {
  menu: boolean;
  setMenu: (value: boolean) => void;
}

export default function NavBar({ menu, setMenu }: Readonly<NavBarProps>) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleNav = (path: string) => {
    setMenu(false);
    router.push(path);
  };

  return (
    <NavContainer>
      <NavButton onClick={() => handleNav("/")}>Home</NavButton>
      {status === "authenticated" && (
        <NavButton onClick={() => handleNav("/search")}>Suche</NavButton>
      )}
      <NavButton onClick={() => handleNav("/login")}>Login</NavButton>
      <CloseButton onClick={() => setMenu(false)}>schließen</CloseButton>
    </NavContainer>
  );
}
