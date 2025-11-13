import { SendTemplatedEmailCommandInput } from "@aws-sdk/client-ses";

export interface BaseEmailSchema {
  senderName: string;
  senderEmail: string;
  receiverName: string;
  receiverEmail: string;
}

export interface RequestEmailSchema extends BaseEmailSchema {
  messagePreview: string;
  isDriver: boolean;
}

export interface MessageEmailSchema extends BaseEmailSchema {
  messageText: string;
}

export interface AcceptanceEmailSchema extends BaseEmailSchema {
  isDriver: boolean;
}

export function generateEmailParams(
  schema: RequestEmailSchema | MessageEmailSchema | AcceptanceEmailSchema,
  type: "request" | "message" | "acceptance",
  includeCc: boolean,
): SendTemplatedEmailCommandInput {
  let templateName: string;
  let templateData: Record<string, any>;

  switch (type) {
    case "request":
      const requestSchema = schema as RequestEmailSchema;
      templateName = requestSchema.isDriver
        ? "DriverRequestTemplate"
        : "RiderRequestTemplate";
      templateData = {
        preferredName: requestSchema.receiverName,
        OtherUser: requestSchema.senderName,
        message: requestSchema.messagePreview,
      };
      break;
    case "message":
      const messageSchema = schema as MessageEmailSchema;
      templateName = "MessageNotificationTemplate";
      templateData = {
        preferredName: messageSchema.receiverName,
        OtherUser: messageSchema.senderName,
        message: messageSchema.messageText,
      };
      break;
    case "acceptance":
      const acceptanceSchema = schema as AcceptanceEmailSchema;
      templateName = acceptanceSchema.isDriver
        ? "DriverAcceptanceTemplate"
        : "RiderAcceptanceTemplate";
      templateData = {
        preferredName: acceptanceSchema.receiverName,
        OtherUser: acceptanceSchema.senderName,
      };
      break;
    default:
      throw new Error("Invalid email type");
  }

  const destination: { ToAddresses: string[]; CcAddresses?: string[] } = {
    ToAddresses: [schema.receiverEmail],
  };

  if (includeCc) {
    destination.CcAddresses = [schema.senderEmail];
  }

  return {
    Source: "no-reply@carpoolnu.com",
    Destination: destination,
    Template: templateName,
    TemplateData: JSON.stringify(templateData),
  };
}
