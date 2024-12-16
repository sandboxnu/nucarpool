import { adminRouter, router } from "../createRouter";
import { z } from "zod";
import { Permission, Role } from "@prisma/client";
import { convertToPublic } from "../../../utils/publicUser";
import { mockSession } from "next-auth/client/__tests__/helpers/mocks";
// Router for admin dashboard queries, only Managers can edit roles
// User must be Manager or Admin to view user data
export const adminDataRouter = router({
  getAllUsers: adminRouter.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
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
        role: true,
        status: true,
        daysWorking: true,
        carpoolId: true,
      },
    });
  }),
  getCarpoolGroups: adminRouter.query(async ({ ctx }) => {
    return ctx.prisma.carpoolGroup.findMany({
      where: {
        AND: [
          {
            users: {
              some: {
                role: Role.DRIVER,
              },
            },
          },
          {
            users: {
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
            users: true,
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
        User: true,
      },
    });
    return messages.map((message) => {
      return {
        ...message,
        User: convertToPublic(message.User),
      };
    });
  }),
  getRequests: adminRouter.query(async ({ ctx }) => {
    return ctx.prisma.request.findMany({
      select: {
        id: true,
        dateCreated: true,
        fromUser: {
          select: {
            role: true,
          },
        },
      },
    });
  }),
  updateUserPermission: adminRouter
    .input(
      z.object({
        userId: z.string(),
        permission: z.nativeEnum(Permission),
      })
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
