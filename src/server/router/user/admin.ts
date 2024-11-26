import { protectedRouter, router } from "../createRouter";
import { z } from "zod";
import { Permission } from "@prisma/client";

// Router for admin dashboard queries, only Managers can edit roles
// User must be Manager or Admin to view user data
export const adminRouter = router({
  getAllUsers: protectedRouter.query(async ({ ctx, input }) => {
    const permission = ctx.session.user?.permission;
    console.log(ctx.session);
    if (permission === "USER") {
      throw new Error("Unauthorized access.");
    }

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
      },
    });
  }),
  updateUserPermission: protectedRouter
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
