import { decryptSecretWithKey } from "@homarr/common/server";

export const ensureValidTokenOrThrow = (checksum: string | undefined, encryptionToken: string | null | undefined) => {
  if (!encryptionToken || !checksum) return;

  const [first, second] = checksum.split("\n");
  if (!first || !second) throw new Error("Malformed checksum");

  const key = Buffer.from(encryptionToken, "hex");
  let decrypted: string;
  try {
    decrypted = decryptSecretWithKey(second as `${string}.${string}`, key);
  } catch {
    throw new Error("Invalid checksum");
  }
  const isValid = decrypted === first;
  if (!isValid) throw new Error("Invalid checksum");
};
