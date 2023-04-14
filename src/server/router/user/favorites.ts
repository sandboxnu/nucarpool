import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter } from "../createProtectedRouter";
import _ from "lodash";
import { convertToPublic } from "../../../utils/publicUser";

// use this router to manage invitations
export const favoritesRouter = createProtectedRouter()
  // Returns the list of favorites for the curent user
  .query("me", {
    async resolve({ ctx }) {
      const id = ctx.session.user?.id;
      const user = await ctx.prisma.user.findUnique({
        where: { id },
        select: {
          favorites: true,
        },
      });

      // throws TRPCError if no user with ID exists
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No profile with id '${id}'`,
        });
      }

      return user.favorites.map(convertToPublic);
    },
  })
  .mutation("edit", {
    input: z.object({
      userId: z.string(),
      favoriteId: z.string(),
      add: z.boolean(),
    }),

    async resolve({ ctx, input }) {
      await ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          favorites: {
            [input.add ? "connect" : "disconnect"]: { id: input.favoriteId },
          },
        },
      });
    },
  });
