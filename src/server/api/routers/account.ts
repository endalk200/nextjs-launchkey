import { safeAwait } from "@/lib/utils/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

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
});
