import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedRouter } from "../createRouter";
import _ from "lodash";
import { convertCarpoolSearchToPublic } from "../../../utils/publicUser";
import { Status } from "@prisma/client";

export const favoritesRouter = router({
  me: protectedRouter.query(async ({ ctx }) => {
    const userId = ctx.session.user?.id;
    
    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated.",
      });
    }

    // get current user role from their CarpoolSearch
    const currentUserSearch = await ctx.prisma.carpoolSearch.findFirst({
      where: { userId },
      select: { role: true },
    });

    if (!currentUserSearch) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `No carpool search found for user ${userId}.`,
      });
    }

    // get user with favorites
    const user = await ctx.prisma.user.findUnique({
      where: { id: userId },
      select: {
        favorites: true,
      },
    });

    // throws TRPCError if no user with ID exists
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `No profile with id '${userId}'`,
      });
    }

    const userRole = currentUserSearch.role;

    // get CarpoolSearches for all favorited users
    const favoritedUserIds = user.favorites.map((f) => f.id);
    const favoriteCarpoolSearches = await ctx.prisma.carpoolSearch.findMany({
      where: {
        userId: { in: favoritedUserIds },
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

    const filteredFavorites = favoriteCarpoolSearches.filter(
      (favorite) =>
        favorite.role !== userRole &&
        favorite.role !== "VIEWER" &&
        favorite.status !== Status.INACTIVE,
    );
    return filteredFavorites.map(convertCarpoolSearchToPublic);
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