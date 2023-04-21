import { MailDataRequired } from "@sendgrid/helpers/classes/mail";
import sgMail from "@sendgrid/mail";
import { serverEnv } from "../../utils/env/server";
import type { NextApiRequest, NextApiResponse } from "next";

sgMail.setApiKey(serverEnv.SENDGRID_API_KEY);

export default async function sendConnectEmail(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const msg = JSON.parse(req.body);
    sgMail.send(msg);
    res.status(200).json("Email sent successfully");
  } catch (err: any) {
    res.status(500).json({ error: err });
  }
}
