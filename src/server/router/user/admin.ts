import { adminRouter, router } from "../createRouter";
import { z } from "zod";
import { Permission, Role } from "@prisma/client";
import { convertCarpoolSearchToPublic } from "../../../utils/publicUser";
import { mockSession } from "next-auth/client/__tests__/helpers/mocks";

// Router for admin dashboard queries, only Managers can edit roles
// User must be Manager or Admin to view user data
export const adminDataRouter = router({
  getAllUsers: adminRouter.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany({
      where: {
        email: {
          not: null,
        },
      },
      select: {
        id: true,
        email: true,
        permission: true,
        isOnboarded: true,
        dateCreated: true,
      },
    });

    // get CarpoolSearch data for each user
    const userIds = users.map(u => u.id);
    const carpoolSearches = await ctx.prisma.carpoolSearch.findMany({
      where: {
        userId: { in: userIds },
      },
      select: {
        userId: true,
        role: true,
        status: true,
        daysWorking: true,
        carpoolId: true,
      },
    });

    // merge CarpoolSearch data into user objects
    return users.map(user => {
      const carpoolSearch = carpoolSearches.find(cs => cs.userId === user.id);
      return {
        ...user,
        role: carpoolSearch?.role ?? 'VIEWER',
        status: carpoolSearch?.status ?? 'INACTIVE',
        daysWorking: carpoolSearch?.daysWorking ?? '',
        carpoolId: carpoolSearch?.carpoolId ?? null,
      };
    });
  }),

  getCarpoolGroups: adminRouter.query(async ({ ctx }) => {
    return ctx.prisma.carpoolGroup.findMany({
      where: {
        AND: [
          {
            carpoolSearches: {
              some: {
                role: Role.DRIVER,
              },
            },
          },
          {
            carpoolSearches: {
              some: {
                role: Role.RIDER,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        dateCreated: true,
        _count: {
          select: {
            carpoolSearches: true,
          },
        },
      },
    });
  }),

  getConversationsMessageCount: adminRouter.query(async ({ ctx }) => {
    return ctx.prisma.conversation.findMany({
      select: {
        id: true,
        dateCreated: true,
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });
  }),

  getMessages: adminRouter.query(async ({ ctx }) => {
    const messages = await ctx.prisma.message.findMany({
      select: {
        conversationId: true,
        dateCreated: true,
        content: true,
        User: {
          select: {
            id: true,
          },
        },
      },
    });

    // get CarpoolSearches for all users in messages
    const userIds = messages.map(m => m.User.id);
    const carpoolSearches = await ctx.prisma.carpoolSearch.findMany({
      where: {
        userId: { in: userIds },
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
          },
        },
        homeLocation: true,
        companyLocation: true,
      },
    });

    return messages.map((message) => {
      const carpoolSearch = carpoolSearches.find(cs => cs.userId === message.User.id);
      return {
        ...message,
        User: carpoolSearch ? convertCarpoolSearchToPublic(carpoolSearch) : null,
      };
    });
  }),

  getRequests: adminRouter.query(async ({ ctx }) => {
    const requests = await ctx.prisma.request.findMany({
      select: {
        id: true,
        dateCreated: true,
        fromUserId: true,
      },
    });

    // get CarpoolSearch data for all fromUsers
    const userIds = requests.map(r => r.fromUserId);
    const carpoolSearches = await ctx.prisma.carpoolSearch.findMany({
      where: {
        userId: { in: userIds },
      },
      select: {
        userId: true,
        role: true,
      },
    });

    return requests.map(request => {
      const carpoolSearch = carpoolSearches.find(cs => cs.userId === request.fromUserId);
      return {
        id: request.id,
        dateCreated: request.dateCreated,
        fromUser: {
          role: carpoolSearch?.role ?? 'VIEWER',
        },
      };
    });
  }),

  updateUserPermission: adminRouter
    .input(
      z.object({
        userId: z.string(),
        permission: z.nativeEnum(Permission),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const permission = ctx.session.user?.permission;
      if (permission !== "MANAGER") {
        throw new Error("Unauthorized access.");
      }
      if (input.userId === ctx.session.user?.id) {
        throw new Error("Cannot change own permission.");
      }

      return ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          permission: input.permission,
        },
      });
    }),
});
