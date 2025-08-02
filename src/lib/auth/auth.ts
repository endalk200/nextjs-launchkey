import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/server/db";
import { env } from "@/env";
import {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendChangeEmailVerification,
    sendDeleteAccountConfirmation,
} from "@/lib/email";

export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true, // Set to true in production
        sendResetPassword: async ({ user, url, token }) => {
            try {
                await sendPasswordResetEmail({ user, url, token });
            } catch (error) {
                console.error("Failed to send password reset email:", error);
                // In production, you might want to handle this more gracefully
                // For now, we'll continue execution to not break the auth flow
            }
        },
        revokeSessionsOnPasswordReset: true,
    },
    user: {
        changeEmail: {
            enabled: true,
            sendChangeEmailVerification: async ({
                user,
                newEmail,
                url,
                token,
            }) => {
                try {
                    await sendChangeEmailVerification({
                        user,
                        newEmail,
                        url,
                        token,
                    });
                } catch (error) {
                    console.error(
                        "Failed to send email change verification:",
                        error,
                    );
                    // In production, you might want to handle this more gracefully
                    // For now, we'll continue execution to not break the auth flow
                }
            },
        },
        deleteUser: {
            enabled: true,
            sendDeleteAccountVerification: async ({ user, url, token }) => {
                try {
                    // Create custom confirmation URL instead of auto-deletion URL
                    const confirmationUrl = `${env.BETTER_AUTH_URL}/dashboard/delete-account?token=${token}`;
                    await sendDeleteAccountConfirmation({
                        user,
                        url: confirmationUrl,
                        token,
                    });
                } catch (error) {
                    console.error(
                        "Failed to send account deletion confirmation:",
                        error,
                    );
                    // In production, you might want to handle this more gracefully
                    // For now, we'll continue execution to not break the auth flow
                }
            },
            beforeDelete: async (user) => {
                console.log(`Preparing to delete account for ${user.email}`);
                // Perform any cleanup before deletion
                console.log(`Starting deletion process for user ${user.id}`);
            },
            afterDelete: async (user) => {
                console.log(`Account deleted for ${user.email}`);
                console.log(
                    `User ${user.id} has been completely removed from the system`,
                );
                console.log(
                    `All sessions for user ${user.email} should now be revoked`,
                );
                // Perform cleanup after deletion
                // Note: Better Auth automatically handles session revocation,
                // but we log this for debugging purposes
            },
        },
    },
    socialProviders: {
        google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
        github: {
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
        },
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url, token }) => {
            try {
                await sendVerificationEmail({ user, url, token });
            } catch (error) {
                console.error("Failed to send verification email:", error);
                // In production, you might want to handle this more gracefully
                // For now, we'll continue execution to not break the auth flow
            }
        },
        sendOnSignUp: true,
        sendOnSignIn: true,
        callbackURL: "/verify-email",
        async afterEmailVerification(user) {
            // Your custom logic here, e.g., grant access to premium features
            console.log(`${user.email} has been successfully verified!`);
        },
    },
    account: {
        accountLinking: {
            enabled: true,
        },
    },
    advanced: {
        useSecureCookies: env.NODE_ENV === "production",
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // 5 minutes
        },
    },
    plugins: [nextCookies()],
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: ["http://localhost:3000"],
});

export type Session = typeof auth.$Infer.Session;
