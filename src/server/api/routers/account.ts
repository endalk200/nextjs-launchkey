import { safeAwait } from "@/lib/utils/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { auth } from "@/lib/auth";

export const accountRouter = createTRPCRouter({
    getUserInfo: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.user.id;

        const [user, error] = await safeAwait(
            ctx.db.user.findUnique({
                where: {
                    id: userId,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    createdAt: true,
                    updatedAt: true,
                    accounts: {
                        select: {
                            providerId: true,
                        },
                    },
                },
            }),
        );

        if (error) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to get user info",
            });
        }

        return {
            id: user?.id,
            name: user?.name,
            email: user?.email,
            image: user?.image,
            createdAt: user?.createdAt,
            updatedAt: user?.updatedAt,
            provider: user?.accounts[0]?.providerId,
        };
    }),

    getLinkedAccounts: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.user.id;

        const [accounts, error] = await safeAwait(
            ctx.db.account.findMany({
                where: {
                    userId: userId,
                },
                select: {
                    id: true,
                    providerId: true,
                    accountId: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: {
                    createdAt: "asc",
                },
            }),
        );

        if (error) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to get linked accounts",
            });
        }

        return accounts || [];
    }),

    getAuthProviders: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.user.id;

        const [accounts, error] = await safeAwait(
            ctx.db.account.findMany({
                where: {
                    userId: userId,
                },
                select: {
                    providerId: true,
                },
                distinct: ["providerId"],
            }),
        );

        if (error) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to get auth providers",
            });
        }

        const providers = accounts?.map((account) => account.providerId) || [];

        return {
            hasCredentialAuth: providers.includes("credential"),
            hasGoogleAuth: providers.includes("google"),
            hasGithubAuth: providers.includes("github"),
            providers,
            canRemoveCredentials:
                providers.length > 1 && providers.includes("credential"),
        };
    }),

    setPassword: protectedProcedure
        .input(
            z.object({
                password: z
                    .string()
                    .min(8, "Password must be at least 8 characters")
                    .regex(
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
                    ),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            try {
                // Use better-auth's setPassword method through the context
                const response = await auth.api.setPassword({
                    body: {
                        newPassword: input.password,
                    },
                    headers: ctx.headers,
                });

                if (!response) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Failed to set password",
                    });
                }

                return { success: true };
            } catch (error) {
                console.error("Set password error:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to set password",
                });
            }
        }),
});
