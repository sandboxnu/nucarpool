import { adminRouter, router } from "../createRouter";
import { z } from "zod";
import { Permission, Status } from "@prisma/client";
import { Role } from "@prisma/client";
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
                status: Status.ACTIVE,
              },
            },
          },
          {
            users: {
              some: {
                role: Role.RIDER,
                status: Status.ACTIVE,
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
