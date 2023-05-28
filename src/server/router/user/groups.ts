import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter } from "../createProtectedRouter";
import _ from "lodash";
import { User } from "@prisma/client";

// use this router to manage invitations
export const groupsRouter = createProtectedRouter()
  // Returns the group(s) for the current user
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

      const groups = await ctx.prisma.carpoolGroup.findMany({
        where: {
          users: {
            some: {
              id: user.id,
            },
          },
        },
      });

      // a map of groupId to the users in it
      const usersByGroup = new Map(
        await Promise.all(
          groups.map(
            async (group): Promise<[id: string, users: User[]]> => [
              group.id,
              await ctx.prisma.user.findMany({
                where: {
                  carpools: {
                    some: {
                      id: group.id,
                    },
                  },
                },
              }),
            ]
          )
        )
      );
      return usersByGroup;
    },
  })
  .mutation("create", {
    input: z.object({
      userId: z.string(),
      groupName: z.string(),
    }),

    async resolve({ ctx, input }) {
      const group = await ctx.prisma.carpoolGroup.create({
        data: {
          name: input.groupName,
          users: {
            connect: { id: input.userId },
          },
        },
      });
      return group;
    },
  })
  .mutation("delete", {
    input: z.object({
      groupId: z.string(),
    }),

    async resolve({ ctx, input }) {
      const group = await ctx.prisma.carpoolGroup.delete({
        where: {
          id: input.groupId,
        },
      });
      return group;
    },
  })
  .mutation("edit", {
    input: z.object({
      userId: z.string(),
      groupId: z.string(),
      add: z.boolean(),
    }),

    async resolve({ ctx, input }) {
      const user = await ctx.prisma.user.update({
        where: { id: input.userId },
        data: {
          carpools: {
            [input.add ? "connect" : "disconnect"]: { id: input.groupId },
          },
        },
      });
      return user;
    },
  });
