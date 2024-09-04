import {
  GetObjectCommand,
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

  const expiry = 3600;

  try {
    return await getSignedUrl(s3Client, command, { expiresIn: expiry });
  } catch (error) {
    console.error("Error generating pre-signed URL for putting", error);
    throw new Error("Could not generate pre-signed URL");
  }
}
export async function getPresignedImageUrl(fileName: string) {
  const command = new GetObjectCommand({
    Bucket: "carpoolnubucket",
    Key: `profile-pictures/${fileName}`,
  });

  const expiry = 3600;

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn: expiry });
    return url;
  } catch (error) {
    console.error("Error generating presigned URL for getting", error);
    throw new Error("Could not generate presigned URL for image retrieval");
  }
}
