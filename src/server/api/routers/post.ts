import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.create({
        data: {
          name: input.name,
        },
      });
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
    });

    return post ?? null;
  }),

  // Protected procedures - require authentication
  createProtected: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // This procedure requires authentication and has access to ctx.user
      return ctx.db.post.create({
        data: {
          name: `${input.name} (by ${ctx.user.name})`,
        },
      });
    }),

  updateProtected: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.update({
        where: { id: input.id },
        data: { name: input.name },
      });
    }),

  deleteProtected: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.delete({
        where: { id: input.id },
      });
    }),

  getCurrentUser: protectedProcedure.query(({ ctx }) => {
    // Returns the authenticated user's information
    return {
      id: ctx.user.id,
      name: ctx.user.name,
      email: ctx.user.email,
      emailVerified: ctx.user.emailVerified,
    };
  }),

  getAllProtected: protectedProcedure.query(async ({ ctx }) => {
    // This is a protected endpoint that returns all posts
    // Only authenticated users can access this
    return ctx.db.post.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),
});
