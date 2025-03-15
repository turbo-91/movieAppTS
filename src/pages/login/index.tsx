import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

function Login() {
  const { data: session } = useSession();
  if (session) {
    const userName = session.user?.name || "user";
    return (
      <>
        <div>Hi, {userName}!</div>
        <button onClick={() => signOut()}>Logout</button>
      </>
    );
  }

  return (
    <div>
      <button onClick={() => signIn("github")}>
        Jetzt einloggen mit
        <Image
          src="/github-mark.png"
          alt="Github mark"
          width={20}
          height={20}
        />
        <Image
          src="/GitHub_Logo.png"
          alt="Github Logo"
          width={60}
          height={20}
        />
      </button>
    </div>
  );
}

export default Login;
