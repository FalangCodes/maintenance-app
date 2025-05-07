import NextAuth from "next-auth";
import Providers from "next-auth/providers";

export const authOptions = {
  providers: [
    Providers.Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
    // Add other providers, for example Firebase
    Providers.Email({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  // Any other NextAuth configuration you need
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
