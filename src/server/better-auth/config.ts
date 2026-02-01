import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";

import { db } from "@/server/db";
import { sendEmail } from "@/lib/email";
import { OTPVerificationEmail } from "@/emails/otp-verification";
import { PasswordResetOTPEmail } from "@/emails/password-reset-otp";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  user: {
    changeEmail: {
      enabled: true,
    },
    additionalFields: {
      firstName: {
        type: "string",
        required: true,
        input: true,
      },
      lastName: {
        type: "string",
        required: true,
        input: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in" || type === "email-verification") {
          await sendEmail({
            to: email,
            subject:
              type === "email-verification"
                ? "Verify your email address"
                : "Sign in to your account",
            react: OTPVerificationEmail({ otp, type }),
          });
        } else {
          // forget-password
          await sendEmail({
            to: email,
            subject: "Reset your password",
            react: PasswordResetOTPEmail({ otp }),
          });
        }
      },
      otpLength: 6,
      expiresIn: 300, // 5 minutes
      sendVerificationOnSignUp: true,
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
