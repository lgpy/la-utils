'server only'

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db";

let baseUrl: string;

if (process.env.VERCEL === "1" && process.env.NODE_ENV === "production") {
  baseUrl = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
} else if (process.env.VERCEL === "1" && process.env.NODE_ENV !== "production") {
  baseUrl = `https://${process.env.VERCEL_PROJECT_STAGING_URL}`;
} else if (process.env.URL) {
  baseUrl = process.env.URL;
} else if (process.env.BETTER_AUTH_URL) {
  baseUrl = process.env.BETTER_AUTH_URL;
} else {
  baseUrl = "http://localhost:3000";
}

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
