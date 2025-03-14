import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { clientPromise } from "@/db/mongodb";

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    }),
    // ...add more providers here
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    async session({ session, user }) {
      // The user object from the database contains the ID of the user in your database

      session.user.userId = user.id;

      // With the code above you can add the user ID to the session object and use it in your pages

      // Make sure you console.log the session and user objects to see what they contain

      return session;
    },
  },
};

export default NextAuth(authOptions);
