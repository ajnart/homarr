"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Anchor, Button, ButtonGroup, Fieldset, Group, Stack, Text, TextInput } from "@mantine/core";
import { IconInfoCircle, IconPencil, IconPlus, IconUnlink } from "@tabler/icons-react";
import { z } from "zod/v4";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import { useSession } from "@homarr/auth/client";
import { revalidatePathActionAsync } from "@homarr/common/client";
import { getAllSecretKindOptions, getDefaultSecretKinds } from "@homarr/definitions";
import { useZodForm } from "@homarr/form";
import { useConfirmModal, useModalAction } from "@homarr/modals";
import { AppSelectModal } from "@homarr/modals-collection";
import { showErrorNotification, showSuccessNotification } from "@homarr/notifications";
import { useI18n } from "@homarr/translation/client";
import { Link } from "@homarr/ui";
import { integrationUpdateSchema } from "@homarr/validation/integration";

import { SecretCard } from "../../_components/secrets/integration-secret-card";
import { IntegrationSecretInput } from "../../_components/secrets/integration-secret-inputs";
import { SecretKindsSegmentedControl } from "../../_components/secrets/integration-secret-segmented-control";
import { IntegrationTestConnectionError } from "../../_components/test-connection/integration-test-connection-error";
import type { AnyMappedTestConnectionError } from "../../_components/test-connection/types";

interface EditIntegrationForm {
  integration: RouterOutputs["integration"]["byId"];
}

const formSchema = integrationUpdateSchema.omit({ id: true, appId: true }).and(
  z.object({
    app: z
      .object({
        id: z.string(),
        name: z.string(),
        iconUrl: z.string(),
        href: z.string().nullable(),
      })
      .nullable(),
  }),
);

export const EditIntegrationForm = ({ integration }: EditIntegrationForm) => {
  const t = useI18n();
  const { openConfirmModal } = useConfirmModal();
  const allSecretKinds = getAllSecretKindOptions(integration.kind);

  const initialSecretsKinds =
    getAllSecretKindOptions(integration.kind).find((secretKinds) =>
      integration.secrets.every((secret) => secretKinds.includes(secret.kind)),
    ) ?? getDefaultSecretKinds(integration.kind);

  const hasUrlSecret = initialSecretsKinds.includes("url");

  const router = useRouter();
  const form = useZodForm(formSchema, {
    initialValues: {
      name: integration.name,
      url: integration.url,
      secrets: initialSecretsKinds.map((kind) => ({
        kind,
        value: integration.secrets.find((secret) => secret.kind === kind)?.value ?? "",
      })),
      app: integration.app ?? null,
    },
  });
  const { mutateAsync, isPending } = clientApi.integration.update.useMutation();
  const [error, setError] = useState<null | AnyMappedTestConnectionError>(null);

  const secretsMap = new Map(integration.secrets.map((secret) => [secret.kind, secret]));

  const handleSubmitAsync = async ({ app, ...values }: FormType) => {
    const url = hasUrlSecret
      ? new URL(values.secrets.find((secret) => secret.kind === "url")?.value ?? values.url).origin
      : values.url;
    await mutateAsync(
      {
        id: integration.id,
        ...values,
        url,
        secrets: values.secrets.map((secret) => ({
          kind: secret.kind,
          value: secret.value === "" ? null : secret.value,
        })),
        appId: app?.id ?? null,
      },
      {
        onSuccess: (data) => {
          // We do it this way as we are unable to send a typesafe error through onError
          if (data?.error) {
            setError(data.error);
            showErrorNotification({
              title: t("integration.page.edit.notification.error.title"),
              message: t("integration.page.edit.notification.error.message"),
            });
            return;
          }

          showSuccessNotification({
            title: t("integration.page.edit.notification.success.title"),
            message: t("integration.page.edit.notification.success.message"),
          });
          void revalidatePathActionAsync("/manage/integrations").then(() => router.push("/manage/integrations"));
        },
        onError: () => {
          showErrorNotification({
            title: t("integration.page.edit.notification.error.title"),
            message: t("integration.page.edit.notification.error.message"),
          });
        },
      },
    );
  };

  const isInitialSecretKinds =
    initialSecretsKinds.every((kind) => form.values.secrets.some((secret) => secret.kind === kind)) &&
    form.values.secrets.length === initialSecretsKinds.length;

  return (
    <form onSubmit={form.onSubmit(async (values) => await handleSubmitAsync(values))}>
      <Stack>
        <TextInput withAsterisk label={t("integration.field.name.label")} {...form.getInputProps("name")} />

        {hasUrlSecret ? null : (
          <TextInput withAsterisk label={t("integration.field.url.label")} {...form.getInputProps("url")} />
        )}

        <Fieldset legend={t("integration.secrets.title")}>
          <Stack gap="sm">
            {allSecretKinds.length > 1 && (
              <SecretKindsSegmentedControl
                defaultKinds={initialSecretsKinds}
                secretKinds={allSecretKinds}
                form={form}
              />
            )}
            {!isInitialSecretKinds
              ? null
              : form.values.secrets.map((secret, index) => (
                  <SecretCard
                    key={secret.kind}
                    secret={secretsMap.get(secret.kind) ?? { kind: secret.kind, value: null, updatedAt: null }}
                    onCancel={() =>
                      new Promise((resolve) => {
                        // When nothing changed, just close the secret card
                        if ((secret.value ?? "") === (secretsMap.get(secret.kind)?.value ?? "")) {
                          return resolve(true);
                        }
                        openConfirmModal({
                          title: t("integration.secrets.reset.title"),
                          children: t("integration.secrets.reset.message"),
                          onCancel: () => resolve(false),
                          onConfirm: () => {
                            form.setFieldValue(`secrets.${index}.value`, secretsMap.get(secret.kind)?.value ?? "");
                            resolve(true);
                          },
                        });
                      })
                    }
                  >
                    <IntegrationSecretInput
                      label={t(`integration.secrets.kind.${secret.kind}.newLabel`)}
                      key={secret.kind}
                      kind={secret.kind}
                      {...form.getInputProps(`secrets.${index}.value`)}
                    />
                  </SecretCard>
                ))}
            {isInitialSecretKinds
              ? null
              : form.values.secrets.map(({ kind }, index) => (
                  <IntegrationSecretInput
                    withAsterisk
                    key={kind}
                    kind={kind}
                    {...form.getInputProps(`secrets.${index}.value`)}
                  />
                ))}
            {form.values.secrets.length === 0 && (
              <Alert icon={<IconInfoCircle size={"1rem"} />} color={"blue"}>
                <Text c={"blue"}>{t("integration.secrets.noSecretsRequired.text")}</Text>
              </Alert>
            )}
          </Stack>
        </Fieldset>

        <IntegrationLinkApp value={form.values.app} onChange={(app) => form.setFieldValue("app", app)} />

        {error !== null && <IntegrationTestConnectionError error={error} url={form.values.url} />}

        <Group justify="end" align="center">
          <Button variant="default" component={Link} href="/manage/integrations">
            {t("common.action.backToOverview")}
          </Button>
          <Button type="submit" loading={isPending}>
            {t("integration.testConnection.action.edit")}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

type FormType = z.infer<typeof formSchema>;

interface IntegrationAppSelectProps {
  value: FormType["app"];
  onChange: (app: FormType["app"]) => void;
}

const IntegrationLinkApp = ({ value, onChange }: IntegrationAppSelectProps) => {
  const { openModal } = useModalAction(AppSelectModal);
  const t = useI18n();
  const { data: session } = useSession();
  const canCreateApps = session?.user.permissions.includes("app-create") ?? false;

  const handleChange = () =>
    openModal(
      {
        onSelect: onChange,
        withCreate: canCreateApps,
      },
      {
        title: t("integration.page.edit.app.action.select"),
      },
    );

  if (!value) {
    return (
      <Button
        variant="subtle"
        color="gray"
        leftSection={<IconPlus size={16} stroke={1.5} />}
        fullWidth
        onClick={handleChange}
      >
        {t("integration.page.edit.app.action.add")}
      </Button>
    );
  }

  return (
    <Fieldset legend={t("integration.field.app.sectionTitle")}>
      <Group justify="space-between">
        <Group gap="sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value.iconUrl} alt={value.name} width={32} height={32} />
          <Stack gap={0}>
            <Text size="sm" fw="bold">
              {value.name}
            </Text>
            {value.href !== null && (
              <Anchor href={value.href} target="_blank" rel="noopener noreferrer" size="sm">
                {value.href}
              </Anchor>
            )}
          </Stack>
        </Group>
        <ButtonGroup>
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconUnlink size={16} stroke={1.5} />}
            onClick={() => onChange(null)}
          >
            {t("integration.page.edit.app.action.remove")}
          </Button>
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconPencil size={16} stroke={1.5} />}
            onClick={handleChange}
          >
            {t("common.action.change")}
          </Button>
        </ButtonGroup>
      </Group>
    </Fieldset>
  );
};
