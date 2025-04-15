import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import styled from "styled-components";
import { IMovie } from "@/db/models/Movie";

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
  setMenu: (value: boolean) => void;
  setSelectedMovie: (movie: IMovie | null) => void;
}

export default function NavBar({
  setMenu,
  setSelectedMovie,
}: Readonly<NavBarProps>) {
  // Route protection
  const { data: session, status } = useSession();
  const router = useRouter();

  // Navigation
  const handleNav = (path: string) => {
    setMenu(false);
    setSelectedMovie(null);
    router.push(path);
  };

  return (
    <NavContainer>
      <NavButton onClick={() => handleNav("/")}>Home</NavButton>
      {status === "authenticated" && (
        <>
          <NavButton onClick={() => handleNav("/search")}>Suche</NavButton>
          <NavButton onClick={() => handleNav("/watchlist")}>
            Watchlist
          </NavButton>
          <CloseButton onClick={() => signOut({ callbackUrl: "/" })}>
            Logout
          </CloseButton>
        </>
      )}
      {status === "unauthenticated" && (
        <CloseButton onClick={() => signIn("github")}>Login</CloseButton>
      )}
      <CloseButton onClick={() => setMenu(false)}>schließen</CloseButton>
    </NavContainer>
  );
}
