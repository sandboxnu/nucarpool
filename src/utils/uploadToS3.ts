import {
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { serverEnv } from "./env/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Create an S3 client instance
const s3Client = new S3Client({
  region: "us-east-2",
  credentials: {
    accessKeyId: serverEnv.AWS_ACCESS_KEY_ID,
    secretAccessKey: serverEnv.AWS_SECRET_ACCESS_KEY,
  },
});

export async function generatePresignedUrl(
  fileName: string,
  contentType: string
) {
  const command = new PutObjectCommand({
    Bucket: "carpoolnubucket",
    Key: `profile-pictures/${fileName}`,
    ContentType: contentType,
  });

  const expiry = 60;

  try {
    return await getSignedUrl(s3Client, command, { expiresIn: expiry });
  } catch (error) {
    console.error("Error generating pre-signed URL", error);
    throw new Error("Could not generate pre-signed URL");
  }
}
