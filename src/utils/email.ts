import { SendEmailCommandInput } from "@aws-sdk/client-ses";

export const generateParams = (schema: emailSchema): SendEmailCommandInput => {
  //TODO: When the AWS account is moved out of the sandbox env, we remove this check
  const dest: string =
    process.env.NODE_ENV === "production"
      ? schema.sendingUser
      : "carpoolnu@gmail.com";
  return {
    Destination: {
      CcAddresses: [schema.receivingUser],
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
  sendingUser: string;
  receivingUser: string;
  subject: string;
  body: string;
}
