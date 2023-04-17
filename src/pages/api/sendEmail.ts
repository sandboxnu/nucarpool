import { MailDataRequired } from "@sendgrid/helpers/classes/mail";
import sgMail from "@sendgrid/mail";
import { serverEnv } from "../../utils/env/server";

sgMail.setApiKey(serverEnv.SENDGRID_API_KEY);

export const sendEmail = async (msg: MailDataRequired) => {
  try {
    await sgMail.send(msg);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error(error);
  }
};
