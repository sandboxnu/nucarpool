import { z } from "zod";
import { router, protectedRouter } from "../createRouter";
import _ from "lodash";
import { generateConnectEmailparams } from "../../../utils/email";
import {
  SendEmailCommand,
  SendTemplatedEmailCommand,
  SendTemplatedEmailCommandInput,
} from "@aws-sdk/client-ses";

const gmailEmailSchema = z.string().email().refine((email) => email.toLowerCase().includes('@gmail'));

export const emailsRouter = router({
  connectEmail: protectedRouter
    .input(
      z.object({
        sendingUserName: z.string(),
        sendingUserEmail: gmailEmailSchema,
        receivingUserName: z.string(),
        receivingUserEmail: gmailEmailSchema,
        body: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const connectEmailParams: SendTemplatedEmailCommandInput =
        generateConnectEmailparams(input);

      const response = await ctx.sesClient.send(
        new SendTemplatedEmailCommand(connectEmailParams)
      );
      return response;
    }),
});
