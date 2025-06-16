'server only'

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db";

let baseUrl: string;
const trustedOrigins: string[] = [];

if (process.env.VERCEL === "1" && process.env.NODE_ENV === "production") {
  console.info("Running in Vercel production mode, using production URL");
  baseUrl = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  trustedOrigins.push("https://la-utilsv2.vercel.app"); // hacky fix for secondary domain
} else if (process.env.VERCEL === "1" && process.env.NODE_ENV !== "production") {
  console.info(`Running in Vercel ${process.env.NODE_ENV} mode, using staging URL`);
  baseUrl = `https://${process.env.VERCEL_PROJECT_STAGING_URL}`;
} else if (process.env.URL) {
  console.info("Running in Netlify");
  baseUrl = process.env.URL;
} else if (process.env.BETTER_AUTH_URL) {
  console.info("Using BETTER_AUTH_URL from environment variables");
  baseUrl = process.env.BETTER_AUTH_URL;
} else {
  console.info("Running in local development mode, using default URL");
  baseUrl = "http://localhost:3000";
}

console.log("Base URL for auth:", baseUrl);

trustedOrigins.push(baseUrl);

export const auth = betterAuth({
  baseURL: baseUrl,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: trustedOrigins,
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    },
  },
})
