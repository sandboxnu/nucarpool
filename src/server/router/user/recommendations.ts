import { TRPCError } from "@trpc/server";
import { protectedRouter, router } from "../createRouter";
import _ from "lodash";
import { convertCarpoolSearchToPublic } from "../../../utils/publicUser";
import { Status, CarpoolSearch, Location, User } from "@prisma/client";
import { calculateScore, Recommendation } from "../../../utils/recommendation";
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
      const userId = ctx.session.user?.id;
      
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated.",
        });
      }
      
      // Get current user's CarpoolSearch for comparison
      const currentUserSearch: (CarpoolSearch & {
        user: User & {
          favorites: User[];
          sentRequests: any[];
          receivedRequests: any[];
        };
        homeLocation: Location | null;
        companyLocation: Location | null;
      }) | null = await ctx.prisma.carpoolSearch.findFirst({
        where: { userId },
        include: {
          user: {
            include: {
              favorites: input.filters.favorites,
              sentRequests: !input.filters.messaged,
              receivedRequests: !input.filters.messaged,
            }
          },
          homeLocation: true,
          companyLocation: true,
        },
      });
      
      if (!currentUserSearch) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No carpool search found for user ${userId}.`,
        });
      }

      const { favorites, sentRequests, receivedRequests } = currentUserSearch.user;

      let excludedUserIds: string[] = [userId];
      if (!input.filters.messaged) {
        excludedUserIds.push(
          ...sentRequests.map((r) => r.toUserId),
          ...receivedRequests.map((r) => r.fromUserId)
        );
      }

      // build CarpoolSearch query
      let carpoolSearchQuery: any = {
        userId: { notIn: excludedUserIds },
        status: Status.ACTIVE,
        user: {
          isOnboarded: true,
        }
      };

      // favorites filter
      if (input.filters.favorites) {
        carpoolSearchQuery.userId = {
          ...carpoolSearchQuery.userId,
          in: favorites.map((f: User) => f.id)
        };
      }

      // query CarpoolSearches with all necessary relations
      const carpoolSearches = await ctx.prisma.carpoolSearch.findMany({
        where: carpoolSearchQuery,
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
              isOnboarded: true,
            }
          },
          homeLocation: true,
          companyLocation: true,
        },
      });

      // calculate scores
      const recs: Recommendation[] = _.compact(
        carpoolSearches.map(calculateScore(currentUserSearch, input.filters, input.sort))
      );
      
      // sort by score
      recs.sort((a: Recommendation, b: Recommendation) => a.score - b.score);
      
      // map back to full CarpoolSearch objects
      const sortedSearches = recs.map((rec) =>
        carpoolSearches.find((search) => search.user.id === rec.id)
      );
      
      const finalSearches = sortedSearches.slice(0, 50);

      // convert to public format
      return Promise.all(
        finalSearches.map((search) => convertCarpoolSearchToPublic(search!))
      );
    }),
});