import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

export type SecretsRecord = Record<string, string>;

export async function getSecrets(): Promise<SecretsRecord> {
  // Local dev fallback: read from env if SECRET_ARN is not provided
  if (!process.env.SECRET_ARN) {
    const keys = ["DATABASE_URL", "JWT_SECRET"];
    const result: SecretsRecord = {};
    for (const k of keys) {
      if (process.env[k]) result[k] = process.env[k]!;
    }
    return result;
  }

  const region = process.env.AWS_REGION || "us-east-1";
  const client = new SecretsManagerClient({ region });
  const cmd = new GetSecretValueCommand({ SecretId: process.env.SECRET_ARN });
  const resp = await client.send(cmd);
  if (!resp.SecretString) throw new Error("SecretsManager returned empty SecretString");
  try {
    const parsed = JSON.parse(resp.SecretString);
    return parsed;
  } catch (e) {
    // If secret is stored as a plain string (not JSON), return it under a default key
    return { SECRET: resp.SecretString };
  }
}
