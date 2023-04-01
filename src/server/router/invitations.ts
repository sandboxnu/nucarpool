import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter } from "./createProtectedRouter";
import _ from "lodash";

// use this router to manage invitations
export const invitationsRouter = createProtectedRouter()
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
        ctx.prisma.invitation.findMany({
          where: { fromUserId: id },
        }),
        ctx.prisma.invitation.findMany({
          where: { toUserId: id },
        }),
      ]);
      return { from, to };
    },
  })
  .mutation("new", {
    input: z.object({
      fromId: z.string(),
      toId: z.string(),
      message: z.string(),
    }),

    async resolve({ ctx, input }) {
      // const [from, to] = await Promise.all([input.fromId, input.toId].map(id => (
      //   ctx.prisma.user.findUnique({
      //     where: { id },
      //   })
      // )))

      // if (!from) {
      //   throw new TRPCError({
      //     code: "NOT_FOUND",
      //     message: `No user with id '${input.fromId}'`,
      //   });
      // }

      // if (!to) {
      //   throw new TRPCError({
      //     code: "NOT_FOUND",
      //     message: `No user with id '${input.toId}'`,
      //   });
      // }

      await ctx.prisma.invitation.create({
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
  .mutation("remove", {
    input: z.object({
      invitationId: z.string(),
    }),

    async resolve({ ctx, input }) {
      const invitation = await ctx.prisma.invitation.findUnique({
        where: { id: input.invitationId },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No invitation with id '${input.invitationId}'`,
        });
      }

      await ctx.prisma.invitation.delete({
        where: {
          id: input.invitationId,
        },
      });
    },
  });
