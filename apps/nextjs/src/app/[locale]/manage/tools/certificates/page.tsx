import { X509Certificate } from "node:crypto";
import { notFound } from "next/navigation";
import { Button, Card, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { IconAlertTriangle, IconCertificate, IconCertificateOff } from "@tabler/icons-react";
import dayjs from "dayjs";

import { auth } from "@homarr/auth/next";
import { getMantineColor } from "@homarr/common";
import { loadCustomRootCertificatesAsync } from "@homarr/core/infrastructure/certificates";
import type { SupportedLanguage } from "@homarr/translation";
import { getI18n } from "@homarr/translation/server";
import { Link } from "@homarr/ui";

import { DynamicBreadcrumb } from "~/components/navigation/dynamic-breadcrumb";
import { NoResults } from "~/components/no-results";
import { AddCertificateButton } from "./_components/add-certificate";
import { RemoveCertificate } from "./_components/remove-certificate";

interface CertificatesPageProps {
  params: Promise<{
    locale: SupportedLanguage;
  }>;
}

export default async function CertificatesPage({ params }: CertificatesPageProps) {
  const session = await auth();
  if (!session?.user.permissions.includes("admin")) {
    notFound();
  }

  const { locale } = await params;
  const t = await getI18n();
  const certificates = await loadCustomRootCertificatesAsync();
  const x509Certificates = certificates
    .map((cert) => {
      try {
        const x509 = new X509Certificate(cert.content);
        return {
          ...cert,
          isError: false,
          x509,
        } as const;
      } catch {
        return {
          ...cert,
          isError: true,
          x509: null,
        } as const;
      }
    })
    .sort((certA, certB) => {
      if (certA.isError) return -1;
      if (certB.isError) return 1;
      return certA.x509.validToDate.getTime() - certB.x509.validToDate.getTime();
    });

  return (
    <>
      <DynamicBreadcrumb />

      <Stack>
        <Group justify="space-between">
          <Stack gap={4}>
            <Title>{t("certificate.page.list.title")}</Title>
            <Text>{t("certificate.page.list.description")}</Text>
          </Stack>

          <Group>
            <Button variant="default" component={Link} href="/manage/tools/certificates/hostnames">
              {t("certificate.page.list.toHostnames")}
            </Button>
            <AddCertificateButton />
          </Group>
        </Group>

        {x509Certificates.length === 0 && (
          <NoResults icon={IconCertificateOff} title={t("certificate.page.list.noResults.title")} />
        )}

        <SimpleGrid cols={{ sm: 1, lg: 2, xl: 3 }} spacing="lg">
          {x509Certificates.map((cert) => (
            <Card key={cert.fileName} withBorder>
              <Group wrap="nowrap">
                {cert.isError ? (
                  <IconAlertTriangle
                    color={getMantineColor("red", 6)}
                    style={{ minWidth: 32 }}
                    size={32}
                    stroke={1.5}
                  />
                ) : (
                  <IconCertificate
                    color={getMantineColor(iconColor(cert.x509.validToDate), 6)}
                    style={{ minWidth: 32 }}
                    size={32}
                    stroke={1.5}
                  />
                )}
                <Stack flex={1} gap="xs" maw="calc(100% - 48px)">
                  <Group justify="space-between" wrap="nowrap">
                    <Text fw={500} lineClamp={1} style={{ wordBreak: "break-all" }}>
                      {cert.isError ? t("certificate.page.list.invalid.title") : cert.x509.subject}
                    </Text>
                    <Text c="gray.6" ta="end" size="sm">
                      {cert.fileName}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    {cert.isError ? (
                      <Text size="sm" c="gray.6">
                        {t("certificate.page.list.invalid.description")}
                      </Text>
                    ) : (
                      <Text size="sm" c="gray.6" title={cert.x509.validToDate.toISOString()}>
                        {t("certificate.page.list.expires", {
                          when: new Intl.RelativeTimeFormat(locale).format(
                            dayjs(cert.x509.validToDate).diff(dayjs(), "days"),
                            "days",
                          ),
                        })}
                      </Text>
                    )}
                    <RemoveCertificate fileName={cert.fileName} />
                  </Group>
                </Stack>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </>
  );
}

const iconColor = (validTo: Date) => {
  const daysUntilInvalid = dayjs(validTo).diff(new Date(), "days");
  if (daysUntilInvalid < 1) return "red";
  if (daysUntilInvalid < 7) return "orange";
  if (daysUntilInvalid < 30) return "yellow";
  return "green";
};
