import { SendEmailCommandInput } from "@aws-sdk/client-ses";

export const generateParams = (schema: emailSchema): SendEmailCommandInput => {
  //TODO: When the AWS account is moved out of the sandbox env, we remove this check
  const dest: string =
    process.env.NODE_ENV === "production"
      ? schema.destination
      : "carpoolnu@gmail.com";
  return {
    Destination: {
      CcAddresses: [],
      ToAddresses: [dest],
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
