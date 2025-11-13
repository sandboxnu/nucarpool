import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedRouter, router } from "../createRouter";

import { convertToPublic } from "../../../utils/publicUser";

// use this router to manage invitations
export const requestsRouter = router({
  me: protectedRouter.query(async ({ ctx }) => {
    const userId = ctx.session.user?.id;

    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    const user = await ctx.prisma.user.findUnique({
      where: { id: userId },
      include: {
        sentRequests: {
          where: {
            toUser: {
              is: {
                status: { not: "INACTIVE" },
              },
            },
          },
          include: {
            toUser: true,
            conversation: {
              include: {
                messages: {
                  orderBy: { dateCreated: "asc" },
                  include: { User: true },
                },
              },
            },
          },
        },
        receivedRequests: {
          where: {
            fromUser: {
              is: {
                status: { not: "INACTIVE" },
              },
            },
          },
          include: {
            fromUser: true,
            conversation: {
              include: {
                messages: {
                  orderBy: { dateCreated: "asc" },
                  include: { User: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `No profile with id '${userId}'`,
      });
    }

    const sent = user.sentRequests.map((req) => {
      return {
        ...req,
        fromUser: convertToPublic(user),
        toUser: convertToPublic(req.toUser),
      };
    });

    const received = user.receivedRequests.map((req) => {
      return {
        ...req,
        fromUser: convertToPublic(req.fromUser),
        toUser: convertToPublic(user),
      };
    });
    const sentGoodRole = sent.filter(
      (req) => req.toUser.role !== user.role && req.toUser.role !== "VIEWER",
    );
    const recGoodRole = received.filter(
      (req) =>
        req.fromUser.role !== user.role && req.fromUser.role !== "VIEWER",
    );
    return { sent: sentGoodRole, received: recGoodRole };
  }),

  create: protectedRouter
    .input(
      z.object({
        fromId: z.string(),
        toId: z.string(),
        message: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user?.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }
      const existingRequests = await ctx.prisma.request.findMany({
        where: {
          OR: [
            {
              fromUserId: input.fromId,
              toUserId: input.toId,
            },
            {
              fromUserId: input.toId,
              toUserId: input.fromId,
            },
          ],
        },
      });

      if (existingRequests.length != 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Existing request between '${input.toId} and ${input.fromId}'`,
        });
      }

      const request = await ctx.prisma.request.create({
        data: {
          message: "",
          fromUser: {
            connect: { id: input.fromId },
          },
          toUser: {
            connect: { id: input.toId },
          },
        },
      });
      let conversation = await ctx.prisma.conversation.findUnique({
        where: { requestId: request.id },
      });

      if (!conversation) {
        conversation = await ctx.prisma.conversation.create({
          data: {
            requestId: request.id,
          },
        });

        // Update the request with the conversation ID
        await ctx.prisma.request.update({
          where: { id: request.id },
          data: { conversationId: conversation.id },
        });
      }

      //  Create the initial message in the conversation
      await ctx.prisma.message.create({
        data: {
          conversationId: conversation.id,
          content: input.message,
          userId: userId,
        },
      });
    }),

  delete: protectedRouter
    .input(
      z.object({
        invitationId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
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
    }),
  edit: protectedRouter
    .input(
      z.object({
        invitationId: z.string(),
        message: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.request.update({
        where: { id: input.invitationId },
        data: {
          message: input.message,
        },
      });
    }),
});
