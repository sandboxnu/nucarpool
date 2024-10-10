import { z } from "zod";
import { router, protectedRouter } from "../createRouter";
import { generateEmailParams, RequestEmailSchema, MessageEmailSchema, AcceptanceEmailSchema } from "../../../utils/email";
import { SendTemplatedEmailCommand } from "@aws-sdk/client-ses";

const gmailEmailSchema = z.string().email().refine(
  (email) => email.toLowerCase().endsWith('@gmail.com'),
  { message: "Only gmail.com email addresses are accepted" }
);

export const emailsRouter = router({
  sendRequestNotification: protectedRouter
    .input(
      z.object({
        senderName: z.string(),
        senderEmail: gmailEmailSchema,
        receiverName: z.string(),
        receiverEmail: gmailEmailSchema,
        isDriver: z.boolean(),
        messagePreview: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const emailParams = generateEmailParams(input, 'request');
      try {
        const response = await ctx.sesClient.send(new SendTemplatedEmailCommand(emailParams));
        console.log(`Email sent successfully to ${input.receiverEmail}. CC: ${input.senderEmail}`);
        console.log('SES Response:', JSON.stringify(response, null, 2));
        return response;
      } catch (error) {
        console.error('Error sending email:', error);
        throw error;
      }
    }),

  sendMessageNotification: protectedRouter
    .input(
      z.object({
        senderName: z.string(),
        senderEmail: gmailEmailSchema,
        receiverName: z.string(),
        receiverEmail: gmailEmailSchema,
        messageText: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const emailParams = generateEmailParams(input, 'message');
      try {
        const response = await ctx.sesClient.send(new SendTemplatedEmailCommand(emailParams));
        console.log(`Message notification sent successfully to ${input.receiverEmail}`);
        console.log('SES Response:', JSON.stringify(response, null, 2));
        return response;
      } catch (error) {
        console.error('Error sending message notification:', error);
        throw error;
      }
    }),

  sendAcceptanceNotification: protectedRouter
    .input(
      z.object({
        senderName: z.string(),
        senderEmail: gmailEmailSchema,
        receiverName: z.string(),
        receiverEmail: gmailEmailSchema,
        isDriver: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const emailParams = generateEmailParams(input, 'acceptance');
      try {
        const response = await ctx.sesClient.send(new SendTemplatedEmailCommand(emailParams));
        console.log(`Acceptance notification sent successfully to ${input.receiverEmail}. CC: ${input.senderEmail}`);
        console.log('SES Response:', JSON.stringify(response, null, 2));
        return response;
      } catch (error) {
        console.error('Error sending acceptance notification:', error);
        throw error;
      }
    }),

  // Add the connectEmail mutation
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
      const emailParams = generateEmailParams({
        senderName: input.sendingUserName,
        senderEmail: input.sendingUserEmail,
        receiverName: input.receivingUserName,
        receiverEmail: input.receivingUserEmail,
        messageText: input.body,
      }, 'message');
      try {
        const response = await ctx.sesClient.send(new SendTemplatedEmailCommand(emailParams));
        console.log(`Connect email sent successfully to ${input.receivingUserEmail}. CC: ${input.sendingUserEmail}`);
        console.log('SES Response:', JSON.stringify(response, null, 2));
        return response;
      } catch (error) {
        console.error('Error sending connect email:', error);
        throw error;
      }
    }),
});