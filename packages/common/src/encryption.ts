import crypto from "crypto";

import { env } from "../env";

const algorithm = "aes-256-cbc"; //Using AES encryption

// We fallback to a key of 0s if the key was not provided because env validation was skipped
// This should only be the case in CI
const key = Buffer.from(env.SECRET_ENCRYPTION_KEY || "0".repeat(64), "hex");

export function encryptSecret(text: string): `${string}.${string}` {
  const initializationVector = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), initializationVector);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${encrypted.toString("hex")}.${initializationVector.toString("hex")}`;
}

export function decryptSecret(value: `${string}.${string}`) {
  return decryptSecretWithKey(value, key);
}

export function decryptSecretWithKey(value: `${string}.${string}`, key: Buffer) {
  const [data, dataIv] = value.split(".") as [string, string];
  const initializationVector = Buffer.from(dataIv, "hex");
  const encryptedText = Buffer.from(data, "hex");
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), initializationVector);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
