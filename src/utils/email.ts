import { SendEmailCommandInput } from "@aws-sdk/client-ses";

export const generateParams = (schema: emailSchema): SendEmailCommandInput => {
  //TODO: When the AWS account is moved out of the sandbox env, we remove this check
  const dest: string =
    process.env.NODE_ENV === "production"
      ? schema.receivingUser
      : "carpoolnu@gmail.com";
  const cc: string =
    process.env.NODE_ENV === "production"
      ? schema.sendingUser
      : "devashishsood9@gmail.com";
  return {
    Destination: {
      CcAddresses: [cc],
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
