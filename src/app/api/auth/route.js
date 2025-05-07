import { auth } from "next-auth";
import FacebookProvider from "next-auth/providers/facebook";
import EmailProvider from "next-auth/providers/email";
import { NextResponse } from "next/server";

export const authConfig = {
  providers: [
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
};

export const GET = async (req) => {
  return auth(req, authConfig);
};

export const POST = async (req) => {
  return auth(req, authConfig);
};
