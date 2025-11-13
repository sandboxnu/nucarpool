import { TRPCError } from "@trpc/server";
import { protectedRouter, router } from "../createRouter";
import _ from "lodash";
import { convertToPublic } from "../../../utils/publicUser";
import { Status } from "@prisma/client";
import { calculateScore } from "../../../utils/recommendation";
import { z } from "zod";

// use this router to manage invitations
export const recommendationsRouter = router({
  me: protectedRouter
    .input(
      z.object({
        sort: z.string(),
        filters: z.object({
          days: z.number(), /// 0 for any, 1 for exact
          daysWorking: z.string(),
          flexDays: z.number(),
          startDistance: z.number(), // max 20, greater = any
          endDistance: z.number(),
          startTime: z.number(), // max = 4 hours, greater = any
          endTime: z.number(),
          startDate: z.date(),
          endDate: z.date(),
          dateOverlap: z.number(), // 0 any, 1 partial, 2 full
          favorites: z.boolean(), // if true, only show users user has favorited
          messaged: z.boolean(), // if false, hide users user has messaged
        }),
      }),
    )
    .query(async ({ input, ctx }) => {
      const id = ctx.session.user?.id;
      const currentUser = await ctx.prisma.user.findUnique({
        where: {
          id: id,
        },
        include: {
          favorites: input.filters.favorites,
          sentRequests: !input.filters.messaged,
          receivedRequests: !input.filters.messaged,
        },
      });
      if (!currentUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No user with id ${id}.`,
        });
      }
      const { favorites, sentRequests, receivedRequests, ...calcUser } =
        currentUser;

      let userQuery: { id: any; isOnboarded: boolean; status: Status } = {
        id: { not: id },
        isOnboarded: true,
        status: Status.ACTIVE,
      };

      // Hide users user has messaged
      if (!input.filters.messaged) {
        userQuery.id["notIn"] = [
          ...sentRequests.map((r) => r.toUserId),
          ...receivedRequests.map((r) => r.fromUserId),
        ];
      }

      // Favorites filter
      if (input.filters.favorites) {
        userQuery.id["in"] = favorites.map((f) => f.id);
      }

      // Construct Query with Filters
      const users = await ctx.prisma.user.findMany({
        where: userQuery,
      });
      const recs = _.compact(
        users.map(calculateScore(calcUser, input.filters, input.sort)),
      );
      recs.sort((a, b) => a.score - b.score);
      const sortedUsers = recs.map((rec) =>
        users.find((user) => user.id === rec.id),
      );
      const finalUsers = sortedUsers.slice(0, 50);

      return Promise.all(finalUsers.map((user) => convertToPublic(user!)));
    }),
});
