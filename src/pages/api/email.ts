import {
  SESClient,
  SendEmailCommand,
  SendEmailCommandInput,
} from "@aws-sdk/client-ses";
import { fromEnv } from "@aws-sdk/credential-provider-env";
import { serverEnv } from "../../utils/env/server";
import { NextApiRequest, NextApiResponse } from "next";

export interface emailSchema {
  destination: string;
  subject: string;
  body: string;
}

const sesClient = new SESClient({
  region: serverEnv.AWS_REGION,
  credentials: fromEnv(),
});

const generateParams = (schema: emailSchema): SendEmailCommandInput => {
  console.log(`schema.body: ${schema.body}`);
  console.log(`schema.subject: ${schema.subject}`);
  return {
    Destination: {
      /* required */ CcAddresses: [],
      ToAddresses: [
        "devashishsood9@gmail.com",
        /* more items */
      ],
    },
    Message: {
      /* required */
      Body: {
        /* required */
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
    Source: "test@carpoolnu.com" /* required */,
    ReplyToAddresses: [],
  };
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("Attempting to send email");
  try {
    const emailData: emailSchema = JSON.parse(req.body);
    const params = generateParams(emailData);
    console.log(JSON.stringify(params, null, 2));
    const data = await sesClient.send(new SendEmailCommand(params));
    res.status(200).json({ message: "Email sent successfully" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

export default handler;
