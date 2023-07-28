import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedRouter } from "../createRouter";
import _ from "lodash";

// use this router to manage invitations
export const groupsRouter = router({
  me: protectedRouter.query(async ({ ctx }) => {
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

    if (user.carpoolId) {
      const group = await ctx.prisma.carpoolGroup.findUnique({
        where: {
          id: user.carpoolId,
        },
      });
      return group;
    }
  }),

  create: protectedRouter
    .input(
      z.object({
        userId: z.string(),
        groupName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const group = await ctx.prisma.carpoolGroup.create({
        data: {
          name: input.groupName,
          users: {
            connect: { id: input.userId },
          },
        },
      });
      return group;
      //maybe adjust the user.carpoolId here? Do we even have to do that manually?
    }),

  delete: protectedRouter
    .input(
      z.object({
        groupId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const group = await ctx.prisma.carpoolGroup.delete({
        where: {
          id: input.groupId,
        },
      });
      return group;
    }),

  edit: protectedRouter
    .input(
      z.object({
        userId: z.string(),
        groupId: z.string(),
        add: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.carpoolGroup.update({
        where: { id: input.groupId },
        data: {
          users: {
            [input.add ? "connect" : "disconnect"]: { id: input.userId },
          },
        },
      });
      return user;
    }),
});
