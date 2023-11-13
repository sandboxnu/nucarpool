import { SendEmailCommandInput } from "@aws-sdk/client-ses";

export const generateConnectEmailparams = (schema: emailSchema) => {
  console.log(schema.sendingUserEmail);
  const params = {
    Source: "no-reply@carpoolnu.com",
    Destination: {
      ToAddresses: [schema.receivingUserEmail],
      CcAddresses: [schema.sendingUserEmail],
    },
    Template: "UserReceivedRequest",
    TemplateData: JSON.stringify({
      preferredName: schema.receivingUserName,
      OtherUser: schema.sendingUserName,
      message: schema.body,
    }),
  };
  return params;
};

export interface emailSchema {
  sendingUserName: string;
  sendingUserEmail: string;
  receivingUserName: string;
  receivingUserEmail: string;
  body: string;
}
