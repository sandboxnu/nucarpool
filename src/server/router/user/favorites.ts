import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedRouter } from "../createRouter";
import _ from "lodash";
import { convertToPublic } from "../../../utils/publicUser";
import { Status } from "@prisma/client";

export const favoritesRouter = router({
  me: protectedRouter.query(async ({ ctx }) => {
    const id = ctx.session.user?.id;
    const user = await ctx.prisma.user.findUnique({
      where: { id },
      select: {
        role: true,
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
    const userRole = user.role;
    const filteredFavorites = user.favorites.filter(
      (favorite) =>
        favorite.role !== userRole &&
        favorite.role !== "VIEWER" &&
        favorite.status !== Status.INACTIVE,
    );
    return filteredFavorites.map(convertToPublic);
  }),
  edit: protectedRouter
    .input(
      z.object({
        userId: z.string(),
        favoriteId: z.string(),
        add: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
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
    }),
});
