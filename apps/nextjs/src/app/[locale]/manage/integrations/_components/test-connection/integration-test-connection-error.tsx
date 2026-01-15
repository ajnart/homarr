import { useMemo } from "react";
import { Accordion, Anchor, Card, Stack, Text } from "@mantine/core";
import { IconSubtask } from "@tabler/icons-react";

import { getMantineColor } from "@homarr/common";
import { useI18n } from "@homarr/translation/client";

import { CertificateErrorDetails } from "./test-connection-certificate";
import type { AnyMappedTestConnectionError, MappedError } from "./types";

interface IntegrationTestConnectionErrorProps {
  error: AnyMappedTestConnectionError;
  url: string;
}

export const IntegrationTestConnectionError = ({ error, url }: IntegrationTestConnectionErrorProps) => {
  const t = useI18n();
  const causeArray = useMemo(() => toCauseArray(error.cause), [error.cause]);

  return (
    <Card withBorder style={{ borderColor: getMantineColor("red", 8) }}>
      <Stack>
        <Stack gap="sm">
          <Text size="lg" fw={500} c="red.8">
            {t(`integration.testConnection.error.${error.type}.title`)}
          </Text>

          {error.type !== "request" && error.type !== "certificate" && error.type !== "statusCode" ? (
            <Text size="md">{t(`integration.testConnection.error.${error.type}.description`)}</Text>
          ) : null}

          {error.type === "request" ? (
            <Text size="md">
              {t(
                `integration.testConnection.error.request.description.${error.data.type}.${error.data.reason}` as never,
              )}
            </Text>
          ) : null}

          {error.type === "statusCode" ? (
            error.data.reason === "other" ? (
              <Text size="md">
                {t.rich("integration.testConnection.error.statusCode.otherDescription", {
                  statusCode: error.data.statusCode.toString(),
                  url: () => <Anchor href={error.data.url}>{error.data.url}</Anchor>,
                })}
              </Text>
            ) : (
              <Text size="md">
                {t.rich("integration.testConnection.error.statusCode.description", {
                  reason: t(`integration.testConnection.error.statusCode.reason.${error.data.reason}`),
                  statusCode: error.data.statusCode.toString(),
                  url: () => <Anchor href={error.data.url}>{error.data.url}</Anchor>,
                })}
              </Text>
            )
          ) : null}

          {error.type === "certificate" ? <CertificateErrorDetails error={error} url={url} /> : null}
        </Stack>

        {error.cause ? (
          <Accordion variant="contained">
            <Accordion.Item value="cause">
              <Accordion.Control icon={<IconSubtask size={16} stroke={1.5} />}>
                {t("integration.testConnection.error.common.cause.title")}
              </Accordion.Control>
              <Accordion.Panel>
                <pre style={{ whiteSpace: "pre-wrap" }}>
                  {error.name}: {error.message}
                  {"\n"}
                  {causeArray
                    .map(
                      (cause) =>
                        `caused by ${cause.name}${cause.message ? `: ${cause.message}` : ""} ${cause.metadata.map((item) => `${item.key}=${item.value}`).join(" ")}`,
                    )
                    .join("\n")}
                </pre>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        ) : null}
      </Stack>
    </Card>
  );
};

const toCauseArray = (cause: MappedError | undefined) => {
  const causeArray: MappedError[] = [];
  let currentCause: MappedError | undefined = cause;
  while (currentCause) {
    causeArray.push(currentCause);
    currentCause = currentCause.cause;
  }
  return causeArray.map(({ cause: _innerCause, ...cause }) => cause);
};
