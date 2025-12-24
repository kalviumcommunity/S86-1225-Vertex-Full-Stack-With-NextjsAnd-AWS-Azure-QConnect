import { randomUUID } from "crypto";

// AWS dependencies
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Azure dependencies
import { BlobServiceClient, StorageSharedKeyCredential, BlobSASPermissions, generateBlobSASQueryParameters, SASProtocol } from "@azure/storage-blob";

const PROVIDER = process.env.STORAGE_PROVIDER || "aws";

// AWS client (initialized lazily)
let s3Client: S3Client | null = null;
function getS3Client() {
  if (!s3Client) {
    s3Client = new S3Client({ region: process.env.AWS_REGION });
  }
  return s3Client;
}

export async function generateUploadUrl({ filename, fileType, expiresIn = 60 }: { filename: string; fileType: string; expiresIn?: number }) {
  const keyPrefix = process.env.FILE_UPLOAD_PREFIX || "uploads";
  const uniqueSuffix = `${Date.now()}-${randomUUID()}`;
  const key = `${keyPrefix}/${uniqueSuffix}-${filename}`;

  if ((PROVIDER || "").toLowerCase() === "aws") {
    const bucket = process.env.AWS_BUCKET_NAME!;
    if (!bucket) throw new Error("AWS_BUCKET_NAME not configured");

    const s3 = getS3Client();
    const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: fileType });
    const url = await getSignedUrl(s3, command, { expiresIn });

    const publicUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return { uploadURL: url, key, publicUrl, method: "PUT", expiresIn };
  }

  if ((PROVIDER || "").toLowerCase() === "azure") {
    const account = process.env.AZURE_ACCOUNT_NAME!;
    const accountKey = process.env.AZURE_ACCOUNT_KEY!;
    const container = process.env.AZURE_CONTAINER_NAME!;

    if (!account || !accountKey || !container) throw new Error("Azure storage not configured properly (AZURE_ACCOUNT_NAME/AZURE_ACCOUNT_KEY/AZURE_CONTAINER_NAME required)");

    const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);

    const expiresOn = new Date(new Date().valueOf() + expiresIn * 1000);

    const permissions = new BlobSASPermissions();
    permissions.create = true;
    permissions.write = true;

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: container,
        blobName: key,
        permissions: permissions,
        protocol: SASProtocol.Https,
        expiresOn,
      },
      sharedKeyCredential
    ).toString();

    const uploadURL = `https://${account}.blob.core.windows.net/${container}/${key}?${sasToken}`;
    const publicUrl = `https://${account}.blob.core.windows.net/${container}/${key}`;

    return { uploadURL, key, publicUrl, method: "PUT", expiresIn };
  }

  throw new Error(`Unsupported storage provider: ${PROVIDER}`);
}
