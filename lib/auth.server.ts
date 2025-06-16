'server only'

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db";

let baseUrl: string;

if (process.env.VERCEL_URL) { // Vercel
  baseUrl = `https://${process.env.VERCEL_URL}`;
} else if (process.env.URL) { // Netlify
  baseUrl = process.env.URL;
} else if (process.env.BETTER_AUTH_URL) { // env file
  baseUrl = process.env.BETTER_AUTH_URL;
} else {
  throw new Error(
    "baseUrl is not defined. Please set environment variable."
  );
}

console.log("Base URL for auth:", baseUrl);

export const auth = betterAuth({
  baseURL: baseUrl,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [baseUrl],
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    },
  },
})
