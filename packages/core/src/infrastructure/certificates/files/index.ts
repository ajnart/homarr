import { X509Certificate } from "node:crypto";
import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { rootCertificates } from "node:tls";

const getCertificateFolder = () => {
  if (process.env.NODE_ENV !== "production") return process.env.LOCAL_CERTIFICATE_PATH;
  return process.env.LOCAL_CERTIFICATE_PATH ?? path.join("/appdata", "trusted-certificates");
};

export const loadCustomRootCertificatesAsync = async () => {
  const folder = getCertificateFolder();

  if (!folder) {
    return [];
  }

  if (!fsSync.existsSync(folder)) {
    await fs.mkdir(folder, { recursive: true });
  }

  const dirContent = await fs.readdir(folder);
  return await Promise.all(
    dirContent
      .filter((file) => file.endsWith(".crt") || file.endsWith(".pem"))
      .map(async (file) => ({
        content: await fs.readFile(path.join(folder, file), "utf8"),
        fileName: file,
      })),
  );
};

export const getAllTrustedCertificatesAsync = async () => {
  const customCertificates = await loadCustomRootCertificatesAsync();
  return rootCertificates.concat(customCertificates.map((cert) => cert.content));
};

export const removeCustomRootCertificateAsync = async (fileName: string) => {
  const folder = getCertificateFolder();
  if (!folder) {
    return null;
  }

  const existingFiles = await fs.readdir(folder, { withFileTypes: true });
  if (!existingFiles.some((file) => file.isFile() && file.name === fileName)) {
    throw new Error(`File ${fileName} does not exist`);
  }

  const fullPath = path.join(folder, fileName);
  const content = await fs.readFile(fullPath, "utf8");

  await fs.rm(fullPath);
  try {
    return new X509Certificate(content);
  } catch {
    return null;
  }
};

export const addCustomRootCertificateAsync = async (fileName: string, content: string) => {
  const folder = getCertificateFolder();
  if (!folder) {
    throw new Error(
      "When you want to use custom certificates locally you need to set LOCAL_CERTIFICATE_PATH to an absolute path",
    );
  }

  if (fileName.includes("/")) {
    throw new Error("Invalid file name");
  }

  await fs.writeFile(path.join(folder, fileName), content);
};
