import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter } from "../createProtectedRouter";
import _ from "lodash";
import { Request, User } from "@prisma/client";
import { convertToPublic } from "../../../utils/publicUser";
import { PublicUser, ResolvedRequest } from "../../../utils/types";

// use this router to manage invitations
export const requestsRouter = createProtectedRouter()
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

      const resolveRequest = async (
        req: Request
      ): Promise<ResolvedRequest & Request> => {
        let [from, to] = await Promise.all([
          ctx.prisma.user.findUnique({
            where: { id: req.fromUserId },
          }),
          ctx.prisma.user.findUnique({
            where: { id: req.toUserId },
          }),
        ]);

        if (!from) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `No user with id '${req.fromUserId}'`,
          });
        }

        if (!to) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `No user with id '${req.toUserId}'`,
          });
        }

        let toUser: User | PublicUser;
        let fromUser: User | PublicUser;

        if (from?.id === ctx.session.user?.id) {
          fromUser = from;
        } else {
          fromUser = convertToPublic(from);
        }

        if (to?.id === ctx.session.user?.id) {
          toUser = to;
        } else {
          toUser = convertToPublic(to);
        }
        return { ...req, fromUser, toUser };
      };

      const [from, to] = await Promise.all([
        ctx.prisma.request
          .findMany({
            where: { fromUserId: id },
          })
          .then((reqs) => Promise.all(reqs.map(resolveRequest))),
        ctx.prisma.request
          .findMany({
            where: { toUserId: id },
          })
          .then((reqs) => Promise.all(reqs.map(resolveRequest))),
      ]);

      return { from, to };
    },
  })
  .mutation("create", {
    input: z.object({
      fromId: z.string(),
      toId: z.string(),
      message: z.string(),
    }),

    async resolve({ ctx, input }) {
      await ctx.prisma.request.create({
        data: {
          message: input.message,
          fromUser: {
            connect: { id: input.fromId },
          },
          toUser: {
            connect: { id: input.toId },
          },
        },
      });
    },
  })
  .mutation("delete", {
    input: z.object({
      invitationId: z.string(),
    }),

    async resolve({ ctx, input }) {
      const invitation = await ctx.prisma.request.findUnique({
        where: { id: input.invitationId },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No invitation with id '${input.invitationId}'`,
        });
      }

      await ctx.prisma.request.delete({
        where: {
          id: input.invitationId,
        },
      });
    },
  })
  .mutation("edit", {
    input: z.object({
      invitationId: z.string(),
      message: z.string(),
    }),

    async resolve({ ctx, input }) {
      const user = await ctx.prisma.request.update({
        where: { id: input.invitationId },
        data: {
          message: input.message,
        },
      });
      return user;
    },
  });
