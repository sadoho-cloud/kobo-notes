import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  // Note: We don't have a database adapter yet, we will just use JWT sessions for now
  // and handle syncing users in our own Cloudflare D1 logic later if needed.
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        // You can attach custom data to the session if needed
      }
      return session;
    },
  },
});
