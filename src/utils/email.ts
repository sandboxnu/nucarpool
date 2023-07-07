import { SendEmailCommandInput } from "@aws-sdk/client-ses";

export const generateParams = (schema: emailSchema): SendEmailCommandInput => {
  return {
    Destination: {
      CcAddresses: [],
      ToAddresses: [
        schema.destination,
        // While our AWS account is in the sandbox env, we can only use manually verified emails. For development, comment out schema.destination, and use the following email instead:
        // "carpoolnu@gmail.com",
      ],
    },
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: schema.body,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: schema.subject,
      },
    },
    Source: "no-reply@carpoolnu.com",
    ReplyToAddresses: [],
  };
};

export interface emailSchema {
  destination: string;
  subject: string;
  body: string;
}
