import { X509Certificate } from "node:crypto";
import { notFound } from "next/navigation";
import {
  Button,
  Group,
  Stack,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  Title,
} from "@mantine/core";
import { IconCertificateOff } from "@tabler/icons-react";

import { auth } from "@homarr/auth/next";
import { getTrustedCertificateHostnamesAsync } from "@homarr/core/infrastructure/certificates";
import { getI18n } from "@homarr/translation/server";
import { Link } from "@homarr/ui";

import { DynamicBreadcrumb } from "~/components/navigation/dynamic-breadcrumb";
import { NoResults } from "~/components/no-results";
import { RemoveHostnameActionIcon } from "./_components/remove-hostname";

export default async function TrustedHostnamesPage() {
  const session = await auth();
  if (!session?.user.permissions.includes("admin")) {
    notFound();
  }

  const t = await getI18n();

  const trustedHostnames = await getTrustedCertificateHostnamesAsync().then((hostnames) => {
    return hostnames.map((hostname) => {
      let subject: string | null;
      try {
        subject = new X509Certificate(hostname.certificate).subject;
      } catch {
        subject = null;
      }
      return {
        ...hostname,
        subject,
      };
    });
  });

  return (
    <>
      <DynamicBreadcrumb />

      <Stack>
        <Group justify="space-between">
          <Stack gap={4}>
            <Title>{t("certificate.page.hostnames.title")}</Title>
            <Text>{t("certificate.page.hostnames.description")}</Text>
          </Stack>

          <Button variant="default" component={Link} href="/manage/tools/certificates">
            {t("certificate.page.hostnames.toCertificates")}
          </Button>
        </Group>

        {trustedHostnames.length === 0 && (
          <NoResults icon={IconCertificateOff} title={t("certificate.page.hostnames.noResults.title")} />
        )}

        {trustedHostnames.length >= 1 && (
          <Table>
            <TableThead>
              <TableTr>
                <TableTh>{t("certificate.field.hostname.label")}</TableTh>
                <TableTh>{t("certificate.field.subject.label")}</TableTh>
                <TableTh>{t("certificate.field.fingerprint.label")}</TableTh>
                <TableTh></TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {trustedHostnames.map(({ hostname, subject, thumbprint }) => (
                <TableTr key={`${hostname}-${thumbprint}`}>
                  <TableTd>{hostname}</TableTd>
                  <TableTd>{subject}</TableTd>
                  <TableTd>{thumbprint}</TableTd>
                  <TableTd>
                    <Group justify="end">
                      <RemoveHostnameActionIcon hostname={hostname} thumbprint={thumbprint} />
                    </Group>
                  </TableTd>
                </TableTr>
              ))}
            </TableTbody>
          </Table>
        )}
      </Stack>
    </>
  );
}
