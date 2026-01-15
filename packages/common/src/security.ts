import { randomBytes } from "crypto";

/**
 * Generates a random hex token twice the size of the given size
 * @param size amount of bytes to generate
 * @returns a random hex token twice the length of the given size
 */
export const generateSecureRandomToken = (size: number) => {
  return randomBytes(size).toString("hex");
};
