import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter } from "../createProtectedRouter";
import _ from "lodash";

// use this router to manage invitations
export const requestsRouter = createProtectedRouter()
  .query("me", {
    async resolve({ ctx }) {
      const id = ctx.session.user?.id;
      const user = await ctx.prisma.user.findUnique({
        where: { id },
      });

      // throws TRPCError if no user with ID exists
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No profile with id '${id}'`,
        });
      }

      const [from, to] = await Promise.all([
        ctx.prisma.request.findMany({
          where: { fromUserId: id },
        }),
        ctx.prisma.request.findMany({
          where: { toUserId: id },
        }),
      ]);
      return { from, to };
    },
  })
  .mutation("create", {
    input: z.object({
      fromId: z.string(),
      toId: z.string(),
      message: z.string(),
    }),

    async resolve({ ctx, input }) {
      await ctx.prisma.request.create({
        data: {
          message: input.message,
          fromUser: {
            connect: { id: input.fromId },
          },
          toUser: {
            connect: { id: input.toId },
          },
        },
      });
    },
  })
  .mutation("delete", {
    input: z.object({
      invitationId: z.string(),
    }),

    async resolve({ ctx, input }) {
      const invitation = await ctx.prisma.request.findUnique({
        where: { id: input.invitationId },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No invitation with id '${input.invitationId}'`,
        });
      }

      await ctx.prisma.request.delete({
        where: {
          id: input.invitationId,
        },
      });
    },
  })
  .mutation("edit", {
    input: z.object({
      invitationId: z.string(),
      message: z.string(),
    }),

    async resolve({ ctx, input }) {
      const user = await ctx.prisma.request.update({
        where: { id: input.invitationId },
        data: {
          message: input.message,
        },
      });
      return user;
    },
  });
