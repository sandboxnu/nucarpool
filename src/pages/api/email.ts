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

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const params = generateParams(req.body);
    const data = sesClient.send(new SendEmailCommand(params));
    console.log("Email sent successfully");
  } catch (err) {
    console.error(err);
  }
};

const generateParams = (schema: emailSchema): SendEmailCommandInput => {
  return {
    Destination: {
      ToAddresses: [schema.destination],
    },
    Message: {
      Body: {
        Text: {
          Data: schema.body,
        },
      },
      Subject: {
        Data: schema.subject,
      },
    },
    Source: schema.subject,
  };
};
