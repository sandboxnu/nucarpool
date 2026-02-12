import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedRouter, router } from "../createRouter";

import { convertCarpoolSearchToPublic } from "../../../utils/publicUser";

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

    // get current user CarpoolSearch
    const currentUserSearch = await ctx.prisma.carpoolSearch.findFirst({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
            preferredName: true,
            pronouns: true,
          }
        },
        homeLocation: true,
        companyLocation: true,
      },
    });

    if (!currentUserSearch) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `No carpool search found for user ${userId}`,
      });
    }

    // get CarpoolSearches for all users in sent requests
    const sentUserIds = user.sentRequests.map((req) => req.toUserId);
    const sentCarpoolSearches = await ctx.prisma.carpoolSearch.findMany({
      where: {
        userId: { in: sentUserIds },
        status: { not: "INACTIVE" },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
            preferredName: true,
            pronouns: true,
          }
        },
        homeLocation: true,
        companyLocation: true,
      },
    });

    // get CarpoolSearches for all users in received requests
    const receivedUserIds = user.receivedRequests.map((req) => req.fromUserId);
    const receivedCarpoolSearches = await ctx.prisma.carpoolSearch.findMany({
      where: {
        userId: { in: receivedUserIds },
        status: { not: "INACTIVE" },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
            preferredName: true,
            pronouns: true,
          }
        },
        homeLocation: true,
        companyLocation: true,
      },
    });

    const sent = user.sentRequests.map((req) => {
      const toUserSearch = sentCarpoolSearches.find(s => s.userId === req.toUserId);
      return {
        ...req,
        fromUser: convertCarpoolSearchToPublic(currentUserSearch),
        toUser: toUserSearch ? convertCarpoolSearchToPublic(toUserSearch) : null,
      };
    });

    const received = user.receivedRequests.map((req) => {
      const fromUserSearch = receivedCarpoolSearches.find(s => s.userId === req.fromUserId);
      return {
        ...req,
        fromUser: fromUserSearch ? convertCarpoolSearchToPublic(fromUserSearch) : null,
        toUser: convertCarpoolSearchToPublic(currentUserSearch),
      };
    });

    const sentGoodRole = sent.filter(
      (req) => req.toUser && req.toUser.role !== currentUserSearch.role && req.toUser.role !== "VIEWER",
    );
    const recGoodRole = received.filter(
      (req) =>
        req.fromUser && req.fromUser.role !== currentUserSearch.role && req.fromUser.role !== "VIEWER",
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
