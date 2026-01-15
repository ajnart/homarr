import { useState } from "react";
import { ActionIcon, Alert, Anchor, Button, Card, CopyButton, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import { IconAlertTriangle, IconCheck, IconCopy, IconExclamationCircle, IconRepeat } from "@tabler/icons-react";

import { clientApi } from "@homarr/api/client";
import { useSession } from "@homarr/auth/client";
import { createId, getMantineColor } from "@homarr/common";
import { createDocumentationLink } from "@homarr/definitions";
import { createModal, useConfirmModal, useModalAction } from "@homarr/modals";
import { AddCertificateModal } from "@homarr/modals-collection";
import { showErrorNotification, showSuccessNotification } from "@homarr/notifications";
import { useCurrentLocale, useI18n, useScopedI18n } from "@homarr/translation/client";

import type { MappedCertificate, MappedTestConnectionCertificateError } from "./types";

interface CertificateErrorDetailsProps {
  error: MappedTestConnectionCertificateError;
  url: string;
}

export const CertificateErrorDetails = ({ error, url }: CertificateErrorDetailsProps) => {
  const tError = useScopedI18n("integration.testConnection.error");
  const { data: session } = useSession();
  const isAdmin = session?.user.permissions.includes("admin") ?? false;
  const [showRetryButton, setShowRetryButton] = useState(false);

  const { openModal: openUploadModal } = useModalAction(AddCertificateModal);
  const { openConfirmModal } = useConfirmModal();
  const { mutateAsync: trustHostnameAsync } = clientApi.certificates.trustHostnameMismatch.useMutation();
  const { mutateAsync: addCertificateAsync } = clientApi.certificates.addCertificate.useMutation();

  const rootCertificate = getHeighestCertificate(error.data.certificate);

  const handleTrustHostname = () => {
    const { hostname } = new URL(url);
    openConfirmModal({
      title: tError("certificate.hostnameMismatch.confirm.title"),
      children: tError("certificate.hostnameMismatch.confirm.message"),
      // eslint-disable-next-line no-restricted-syntax
      async onConfirm() {
        await trustHostnameAsync(
          {
            hostname,
            certificate: error.data.certificate.pem,
          },
          {
            onSuccess() {
              showSuccessNotification({
                title: tError("certificate.hostnameMismatch.notification.success.title"),
                message: tError("certificate.hostnameMismatch.notification.success.message"),
              });
              setShowRetryButton(true);
            },
            onError() {
              showErrorNotification({
                title: tError("certificate.hostnameMismatch.notification.error.title"),
                message: tError("certificate.hostnameMismatch.notification.error.message"),
              });
            },
          },
        );
      },
    });
  };

  const handleTrustSelfSigned = () => {
    const { hostname } = new URL(url);
    openConfirmModal({
      title: tError("certificate.selfSigned.confirm.title"),
      children: tError("certificate.selfSigned.confirm.message"),
      // eslint-disable-next-line no-restricted-syntax
      async onConfirm() {
        const formData = new FormData();
        formData.append(
          "file",
          new File([rootCertificate.pem], `${hostname}-${createId()}.crt`, {
            type: "application/x-x509-ca-cert",
          }),
        );
        await addCertificateAsync(formData, {
          onSuccess() {
            showSuccessNotification({
              title: tError("certificate.selfSigned.notification.success.title"),
              message: tError("certificate.selfSigned.notification.success.message"),
            });
            setShowRetryButton(true);
          },
          onError() {
            showErrorNotification({
              title: tError("certificate.selfSigned.notification.error.title"),
              message: tError("certificate.selfSigned.notification.error.message"),
            });
          },
        });
      },
    });
  };

  const description = <Text size="md">{tError(`certificate.description.${error.data.reason}`)}</Text>;

  if (!isAdmin) {
    return (
      <>
        {description}
        <NotEnoughPermissionsAlert />
      </>
    );
  }

  return (
    <>
      {description}

      <CertificateDetailsCard certificate={rootCertificate} />

      {error.data.reason === "hostnameMismatch" && <HostnameMismatchAlert />}

      {!rootCertificate.isSelfSigned && error.data.reason === "untrusted" && <CertificateExtractAlert />}

      {showRetryButton && (
        <Button
          variant="default"
          fullWidth
          leftSection={<IconRepeat size={16} color={getMantineColor("blue", 6)} stroke={1.5} />}
          type="submit"
        >
          {tError("certificate.action.retry.label")}
        </Button>
      )}

      {(error.data.reason === "untrusted" && rootCertificate.isSelfSigned) ||
      error.data.reason === "hostnameMismatch" ? (
        <Button
          variant="default"
          fullWidth
          onClick={error.data.reason === "hostnameMismatch" ? handleTrustHostname : handleTrustSelfSigned}
        >
          {tError("certificate.action.trust.label")}
        </Button>
      ) : null}
      {error.data.reason === "untrusted" && !rootCertificate.isSelfSigned ? (
        <Button
          variant="default"
          fullWidth
          onClick={() =>
            openUploadModal({
              onSuccess() {
                setShowRetryButton(true);
              },
            })
          }
        >
          {tError("certificate.action.upload.label")}
        </Button>
      ) : null}
    </>
  );
};

const NotEnoughPermissionsAlert = () => {
  const t = useI18n();
  return (
    <Alert
      icon={<IconAlertTriangle size={16} />}
      title={t("integration.testConnection.error.certificate.alert.permission.title")}
      color="yellow"
    >
      {t("integration.testConnection.error.certificate.alert.permission.message")}
    </Alert>
  );
};

const HostnameMismatchAlert = () => {
  const t = useI18n();
  return (
    <Alert
      icon={<IconAlertTriangle size={16} />}
      title={t("integration.testConnection.error.certificate.alert.hostnameMismatch.title")}
      color="yellow"
    >
      {t("integration.testConnection.error.certificate.alert.hostnameMismatch.message")}
    </Alert>
  );
};

const CertificateExtractAlert = () => {
  const t = useI18n();
  return (
    <Alert
      icon={<IconExclamationCircle size={16} />}
      title={t("integration.testConnection.error.certificate.alert.extract.title")}
      color="red"
    >
      {t.rich("integration.testConnection.error.certificate.alert.extract.message", {
        docsLink: () => (
          <Anchor
            href={createDocumentationLink("/docs/management/certificates", "#obtaining-certificates")}
            target="_blank"
          >
            {t("common.here")}
          </Anchor>
        ),
      })}
    </Alert>
  );
};

interface CertificateDetailsProps {
  certificate: MappedCertificate;
}

export const CertificateDetailsCard = ({ certificate }: CertificateDetailsProps) => {
  const { openModal } = useModalAction(PemContentModal);
  const locale = useCurrentLocale();
  const tDetails = useScopedI18n("integration.testConnection.error.certificate.details");
  const tCertificateField = useScopedI18n("certificate.field");

  return (
    <Card withBorder>
      <Text fw={500}>{tDetails("title")}</Text>
      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          {tDetails("description")}
        </Text>
        <Anchor
          size="sm"
          ta="start"
          component="button"
          type="button"
          onClick={() => openModal({ content: certificate.pem })}
        >
          {tDetails("content.action")}
        </Anchor>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 2 }} mt="md">
        <Stack gap={0}>
          <Text size="xs" c="dimmed">
            {tCertificateField("subject.label")}
          </Text>
          <Text size="sm">{certificate.subject}</Text>
        </Stack>
        <Stack gap={0}>
          <Text size="xs" c="dimmed">
            {tCertificateField("issuer.label")}
          </Text>
          <Text size="sm">{certificate.issuer}</Text>
        </Stack>
        <Stack gap={0}>
          <Text size="xs" c="dimmed">
            {tCertificateField("validFrom.label")}
          </Text>
          <Text size="sm">
            {new Intl.DateTimeFormat(locale, {
              dateStyle: "full",
              timeStyle: "long",
            }).format(certificate.validFrom)}
          </Text>
        </Stack>
        <Stack gap={0}>
          <Text size="xs" c="dimmed">
            {tCertificateField("validTo.label")}
          </Text>
          <Text size="sm">
            {new Intl.DateTimeFormat(locale, {
              dateStyle: "full",
              timeStyle: "long",
            }).format(certificate.validTo)}
          </Text>
        </Stack>
        <Stack gap={0}>
          <Text size="xs" c="dimmed">
            {tCertificateField("serialNumber.label")}
          </Text>
          <Text size="sm">{certificate.serialNumber}</Text>
        </Stack>
      </SimpleGrid>

      <SimpleGrid cols={1} mt="md">
        <Stack gap={0}>
          <Text size="xs" c="dimmed">
            {tCertificateField("fingerprint.label")}
          </Text>
          <Text size="sm">{certificate.fingerprint}</Text>
        </Stack>
      </SimpleGrid>
    </Card>
  );
};

const PemContentModal = createModal<{ content: string }>(({ actions, innerProps }) => {
  const t = useI18n();

  return (
    <Stack>
      <Card w="100%" pos="relative" bg="dark.6" fz="xs" p="sm">
        <pre
          style={{
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
          }}
        >
          {innerProps.content}
        </pre>
        <CopyButton value={innerProps.content}>
          {({ copy, copied }) => (
            <ActionIcon onClick={copy} pos="absolute" top={8} right={8} variant="default">
              {copied ? (
                <IconCheck size={16} stroke={1.5} color={getMantineColor("green", 6)} />
              ) : (
                <IconCopy size={16} stroke={1.5} />
              )}
            </ActionIcon>
          )}
        </CopyButton>
      </Card>

      <Button variant="light" color="gray" onClick={actions.closeModal}>
        {t("common.action.close")}
      </Button>
    </Stack>
  );
}).withOptions({
  defaultTitle(t) {
    return t("integration.testConnection.error.certificate.details.content.title");
  },
  size: "lg",
});

const getHeighestCertificate = (certificate: MappedCertificate): MappedCertificate => {
  if (certificate.issuerCertificate) return getHeighestCertificate(certificate.issuerCertificate);
  return certificate;
};
