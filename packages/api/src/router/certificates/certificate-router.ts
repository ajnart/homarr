import { X509Certificate } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { zfd } from "zod-form-data";
import { z } from "zod/v4";

import {
  addCustomRootCertificateAsync,
  removeCustomRootCertificateAsync,
} from "@homarr/core/infrastructure/certificates";
import { createLogger } from "@homarr/core/infrastructure/logs";
import { and, eq } from "@homarr/db";
import { trustedCertificateHostnames } from "@homarr/db/schema";
import { certificateValidFileNameSchema, checkCertificateFile } from "@homarr/validation/certificates";

import { createTRPCRouter, permissionRequiredProcedure } from "../../trpc";

const logger = createLogger({ module: "certificateRouter" });

export const certificateRouter = createTRPCRouter({
  addCertificate: permissionRequiredProcedure
    .requiresPermission("admin")
    .input(
      zfd.formData({
        file: zfd.file().check(checkCertificateFile),
      }),
    )
    .mutation(async ({ input }) => {
      const content = await input.file.text();

      // Validate the certificate
      let x509Certificate: X509Certificate;
      try {
        x509Certificate = new X509Certificate(content);
        logger.info("Adding trusted certificate", {
          subject: x509Certificate.subject,
          issuer: x509Certificate.issuer,
        });
      } catch {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid certificate",
        });
      }

      await addCustomRootCertificateAsync(input.file.name, content);

      logger.info("Added trusted certificate", {
        subject: x509Certificate.subject,
        issuer: x509Certificate.issuer,
      });
    }),
  trustHostnameMismatch: permissionRequiredProcedure
    .requiresPermission("admin")
    .input(z.object({ hostname: z.string(), certificate: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Validate the certificate
      let x509Certificate: X509Certificate;
      try {
        x509Certificate = new X509Certificate(input.certificate);
        logger.info("Adding trusted hostname", {
          subject: x509Certificate.subject,
          issuer: x509Certificate.issuer,
          thumbprint: x509Certificate.fingerprint256,
          hostname: input.hostname,
        });
      } catch {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid certificate",
        });
      }

      await ctx.db.insert(trustedCertificateHostnames).values({
        hostname: input.hostname,
        thumbprint: x509Certificate.fingerprint256,
        certificate: input.certificate,
      });

      logger.info("Added trusted hostname", {
        subject: x509Certificate.subject,
        issuer: x509Certificate.issuer,
        thumbprint: x509Certificate.fingerprint256,
        hostname: input.hostname,
      });
    }),
  removeTrustedHostname: permissionRequiredProcedure
    .requiresPermission("admin")
    .input(z.object({ hostname: z.string(), thumbprint: z.string() }))
    .mutation(async ({ ctx, input }) => {
      logger.info("Removing trusted hostname", {
        hostname: input.hostname,
        thumbprint: input.thumbprint,
      });
      const dbResult = await ctx.db
        .delete(trustedCertificateHostnames)
        .where(
          and(
            eq(trustedCertificateHostnames.hostname, input.hostname),
            eq(trustedCertificateHostnames.thumbprint, input.thumbprint),
          ),
        );

      logger.info("Removed trusted hostname", {
        hostname: input.hostname,
        thumbprint: input.thumbprint,
        count: dbResult.changes,
      });
    }),
  removeCertificate: permissionRequiredProcedure
    .requiresPermission("admin")
    .input(z.object({ fileName: certificateValidFileNameSchema }))
    .mutation(async ({ input, ctx }) => {
      logger.info("Removing trusted certificate", {
        fileName: input.fileName,
      });

      const certificate = await removeCustomRootCertificateAsync(input.fileName);
      if (!certificate) return;

      // Delete all trusted hostnames for this certificate
      await ctx.db
        .delete(trustedCertificateHostnames)
        .where(eq(trustedCertificateHostnames.thumbprint, certificate.fingerprint256));

      logger.info("Removed trusted certificate", {
        fileName: input.fileName,
        subject: certificate.subject,
        issuer: certificate.issuer,
      });
    }),
});
