import { TRPCError } from "@trpc/server";
import { protectedRouter, router } from "../createRouter";
import { z } from "zod";

export const messageRouter = router({
  getUnreadMessageCount: protectedRouter.query(async ({ ctx }) => {
    const userId = ctx.session.user?.id;
    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    return ctx.prisma.message.count({
      where: {
        isRead: false,
        userId: {
          not: userId,
        },
        conversation: {
          request: {
            OR: [{ fromUserId: userId }, { toUserId: userId }],
          },
        },
      },
    });
  }),

  getRequests: protectedRouter.query(async ({ ctx }) => {
    const userId = ctx.session.user?.id;
    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    return ctx.prisma.request.findMany({
      where: {
        OR: [{ fromUserId: userId }, { toUserId: userId }],
      },
      include: {
        fromUser: true,
        toUser: true,
        conversation: {
          include: {
            messages: {
              orderBy: {
                dateCreated: "desc",
              },
            },
            request: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });
  }),

  getMessages: protectedRouter
    .input(z.string())
    .query(async ({ ctx, input: conversationId }) => {
      const userId = ctx.session.user?.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      return ctx.prisma.message.findMany({
        where: { conversationId },
        orderBy: { dateCreated: "asc" },
        include: {
          User: {
            select: { id: true, name: true, preferredName: true, image: true },
          },
        },
      });
    }),

  sendMessage: protectedRouter
    .input(
      z.object({
        requestId: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user?.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      // Check if a conversation exists for this request, if not create one
      let conversation = await ctx.prisma.conversation.findUnique({
        where: { requestId: input.requestId },
      });

      if (!conversation) {
        conversation = await ctx.prisma.conversation.create({
          data: { requestId: input.requestId },
        });
      }

      return ctx.prisma.message.create({
        data: {
          conversationId: conversation.id,
          content: input.content,
          userId: userId,
        },
      });
    }),

  markMessagesAsRead: protectedRouter
    .input(
      z.object({
        messageIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user?.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      return ctx.prisma.message.updateMany({
        where: {
          id: { in: input.messageIds },
          conversation: {
            request: {
              OR: [{ fromUserId: userId }, { toUserId: userId }],
            },
          },
        },
        data: {
          isRead: true,
        },
      });
    }),
});
