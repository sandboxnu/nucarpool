import { TRPCError } from "@trpc/server";
import { router, protectedRouter } from "../createRouter";
import _ from "lodash";
import { z } from "zod";

// use this router to manage messaging
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
        conversation: {
          request: {
            OR: [
              { toUserId: userId },
            ],
          },
        },
        isRead: false,
        User: {
          id: { not: userId },
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
        OR: [
          { fromUserId: userId },
          { toUserId: userId },
        ],
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            preferredName: true,
            image: true,
            bio: true,
            pronouns: true,
            role: true,
            status: true,
            seatAvail: true,
            companyName: true,
            startAddress: true,
            daysWorking: true,
            startTime: true,
            endTime: true,
          },
        },
        toUser: {
          select: {
            id: true,
            name: true,
            preferredName: true,
            image: true,
            bio: true,
            pronouns: true,
            role: true,
            status: true,
            seatAvail: true,
            companyName: true,
            startAddress: true,
            daysWorking: true,
            startTime: true,
            endTime: true,
          },
        },
        conversation: {
          include: {
            messages: {
              orderBy: { id: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        id: 'desc', // This will return the most recent requests first
      },
    });
  }),

  getMessages: protectedRouter.input(z.string()).query(async ({ ctx, input: conversationId }) => {
    const userId = ctx.session.user?.id;
    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    return ctx.prisma.message.findMany({
      where: { conversationId },
      orderBy: { id: 'asc' },
      include: {
        User: {
          select: { id: true, name: true, preferredName: true, image: true },
        },
      },
    });
  }),

  sendMessage: protectedRouter.input(z.object({
    conversationId: z.string(),
    content: z.string(),
  })).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user?.id;
    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    return ctx.prisma.message.create({
      data: {
        conversationId: input.conversationId,
        content: input.content,
        userId: userId,
      },
    });
  }),

  markMessagesAsRead: protectedRouter.input(z.object({
    messageIds: z.array(z.string()),
  })).mutation(async ({ ctx, input }) => {
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
            OR: [
              { fromUserId: userId },
              { toUserId: userId },
            ],
          },
        },
      },
      data: {
        isRead: true,
      },
    });
  }),
});