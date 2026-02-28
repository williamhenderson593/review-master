import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { sendEmail, verificationEmail, resetPasswordEmail } from "@/lib/email";

const protocol = process.env.NEXT_PUBLIC_PROTOCOL || "http";
const domain = process.env.NEXT_PUBLIC_DOMAIN || "localhost:3003";

export const auth = betterAuth({
  baseURL: `${protocol}://app.${domain}`,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password - Telaven",
        html: resetPasswordEmail(url),
      });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email - Telaven",
        html: verificationEmail(url),
      });
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
        input: true,
      },
      country: {
        type: "string",
        required: false,
        input: true,
      },
      clientId: {
        type: "string",
        required: false,
        input: true,
        fieldName: "clientId",
      },
      roleId: {
        type: "string",
        required: false,
        input: true,
        fieldName: "roleId",
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  advanced: {
    cookiePrefix: "better-auth",
    ...(process.env.NEXT_PUBLIC_COOKIE_DOMAIN ? {
      crossSubDomainCookies: {
        enabled: true,
        domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
      },
    } : {}),
  },

  trustedOrigins: [
    process.env.APP_URL || "http://localhost:3003",
    process.env.NEXT_PUBLIC_APP_URL || "http://app.localhost:3003",
    `http://localhost:3003`,
    `http://app.localhost:3003`,
    ...(process.env.NEXT_PUBLIC_DOMAIN ? [
      `${process.env.NEXT_PUBLIC_PROTOCOL || 'https'}://${process.env.NEXT_PUBLIC_DOMAIN}`,
      `${process.env.NEXT_PUBLIC_PROTOCOL || 'https'}://app.${process.env.NEXT_PUBLIC_DOMAIN}`,
    ] : []),
  ],
});

export type Session = typeof auth.$Infer.Session;
