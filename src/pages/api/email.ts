import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { fromEnv } from "@aws-sdk/credential-provider-env";
import { serverEnv } from "../../utils/env/server";
import { NextApiRequest, NextApiResponse } from "next";
import { emailSchema, generateParams } from "../../utils/email";

const sesClient = new SESClient({
  region: serverEnv.AWS_REGION,
  credentials: fromEnv(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Attempting to send email");
  try {
    const emailData: emailSchema = req.body;
    const params = generateParams(emailData);
    const data = await sesClient.send(new SendEmailCommand(params));
    res.status(200).json({ message: "Email sent successfully", data: data });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}
