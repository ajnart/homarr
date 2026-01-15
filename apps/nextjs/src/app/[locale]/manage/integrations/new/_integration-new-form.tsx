"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Checkbox,
  Collapse,
  Fieldset,
  Group,
  Loader,
  SegmentedControl,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconCheck, IconInfoCircle } from "@tabler/icons-react";
import { z } from "zod/v4";

import { clientApi } from "@homarr/api/client";
import { useSession } from "@homarr/auth/client";
import { revalidatePathActionAsync } from "@homarr/common/client";
import type { Modify } from "@homarr/common/types";
import type { IntegrationKind } from "@homarr/definitions";
import {
  getAllSecretKindOptions,
  getIconUrl,
  getIntegrationDefaultUrl,
  getIntegrationName,
  integrationDefs,
} from "@homarr/definitions";
import type { GetInputPropsReturnType, UseFormReturnType } from "@homarr/form";
import { useZodForm } from "@homarr/form";
import { showErrorNotification, showSuccessNotification } from "@homarr/notifications";
import { useI18n } from "@homarr/translation/client";
import { Link } from "@homarr/ui";
import { appHrefSchema } from "@homarr/validation/app";
import { integrationCreateSchema } from "@homarr/validation/integration";

import { IntegrationSecretInput } from "../_components/secrets/integration-secret-inputs";
import { SecretKindsSegmentedControl } from "../_components/secrets/integration-secret-segmented-control";
import { IntegrationTestConnectionError } from "../_components/test-connection/integration-test-connection-error";
import type { AnyMappedTestConnectionError } from "../_components/test-connection/types";

interface NewIntegrationFormProps {
  searchParams: Partial<z.infer<typeof integrationCreateSchema>> & {
    kind: IntegrationKind;
  };
}

const formSchema = integrationCreateSchema.omit({ kind: true, app: true }).and(
  z.object({
    hasApp: z.boolean(),
    appHref: appHrefSchema,
    appId: z.string().nullable(),
  }),
);

export const NewIntegrationForm = ({ searchParams }: NewIntegrationFormProps) => {
  const t = useI18n();
  const secretKinds = getAllSecretKindOptions(searchParams.kind);
  const hasUrlSecret = secretKinds.some((kinds) => kinds.includes("url"));
  const router = useRouter();
  const { data: session } = useSession();
  const canCreateApps = session?.user.permissions.includes("app-create") ?? false;

  let url = searchParams.url ?? getIntegrationDefaultUrl(searchParams.kind) ?? "";
  if (hasUrlSecret) {
    // Placeholder Url, replaced with origin of the secret Url on submit
    url = "http://localhost";
  }
  const form = useZodForm(formSchema, {
    initialValues: {
      name: searchParams.name ?? getIntegrationName(searchParams.kind),
      url,
      secrets: secretKinds[0].map((kind) => ({
        kind,
        value: "",
      })),
      attemptSearchEngineCreation: true,
      hasApp: false,
      appHref: url,
      appId: null,
    },
  });

  const { mutateAsync: createIntegrationAsync, isPending } = clientApi.integration.create.useMutation({
    async onSuccess() {
      await revalidatePathActionAsync("/manage/integrations");
    },
  });
  const [error, setError] = useState<null | AnyMappedTestConnectionError>(null);

  const handleSubmitAsync = async ({ appId, appHref, hasApp, ...values }: FormType) => {
    const url = hasUrlSecret
      ? new URL(values.secrets.find((secret) => secret.kind === "url")?.value ?? values.url).origin
      : values.url;

    const hasCustomHref = appHref !== null && appHref.trim().length >= 1;

    const app = hasApp
      ? appId !== null
        ? { id: appId }
        : {
            name: values.name,
            href: hasCustomHref ? appHref : url,
            iconUrl: getIconUrl(searchParams.kind),
            description: null,
            pingUrl: url,
          }
      : undefined;

    await createIntegrationAsync(
      {
        kind: searchParams.kind,
        ...values,
        url,
        app,
      },
      {
        onSuccess(data) {
          // We do it this way as we are unable to send a typesafe error through onError
          if (data?.error) {
            setError(data.error);
            showErrorNotification({
              title: t("integration.page.create.notification.error.title"),
              message: t("integration.page.create.notification.error.message"),
            });
            return;
          }

          showSuccessNotification({
            title: t("integration.page.create.notification.success.title"),
            message: t("integration.page.create.notification.success.message"),
          });

          router.push("/manage/integrations");
        },
        onError: () => {
          showErrorNotification({
            title: t("integration.page.create.notification.error.title"),
            message: t("integration.page.create.notification.error.message"),
          });
        },
      },
    );
  };

  const supportsSearchEngine = integrationDefs[searchParams.kind].category.flat().includes("search");

  return (
    <form onSubmit={form.onSubmit((value) => void handleSubmitAsync(value))}>
      <Stack>
        <TextInput withAsterisk label={t("integration.field.name.label")} autoFocus {...form.getInputProps("name")} />

        {hasUrlSecret ? null : (
          <TextInput withAsterisk label={t("integration.field.url.label")} {...form.getInputProps("url")} />
        )}

        <Fieldset legend={t("integration.secrets.title")}>
          <Stack gap="sm">
            {secretKinds.length > 1 && <SecretKindsSegmentedControl secretKinds={secretKinds} form={form} />}
            {form.values.secrets.map(({ kind }, index) => (
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

        {error !== null && <IntegrationTestConnectionError error={error} url={form.values.url} />}

        {supportsSearchEngine && (
          <Checkbox
            label={t("integration.field.attemptSearchEngineCreation.label")}
            description={t("integration.field.attemptSearchEngineCreation.description", {
              kind: getIntegrationName(searchParams.kind),
            })}
            {...form.getInputProps("attemptSearchEngineCreation", { type: "checkbox" })}
          />
        )}

        <AppForm form={form} canCreateApps={canCreateApps} />

        <Group justify="end" align="center">
          <Button variant="default" component={Link} href="/manage/integrations">
            {t("common.action.backToOverview")}
          </Button>
          <Button type="submit" loading={isPending}>
            {t("integration.testConnection.action.create")}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

type FormType = z.infer<typeof formSchema>;

const AppForm = ({ form, canCreateApps }: { form: UseFormReturnType<FormType>; canCreateApps: boolean }) => {
  const t = useI18n();
  const checkboxInputProps = form.getInputProps("hasApp", { type: "checkbox" });

  return (
    <>
      <Checkbox
        {...checkboxInputProps}
        onChange={(event) => {
          startTransition(() => {
            form.setFieldValue("appHref", event.currentTarget.checked ? form.values.url : null);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            checkboxInputProps.onChange(event);
          });
        }}
        label={t("integration.field.createApp.label")}
        description={t("integration.field.createApp.description")}
      />

      <Collapse in={form.values.hasApp}>
        <Fieldset legend={t("integration.field.app.sectionTitle")}>
          <Stack gap="sm">
            {canCreateApps && (
              <SegmentedControl
                data={(["new", "existing"] as const).map((value) => ({
                  value,
                  label: t(`integration.page.create.app.option.${value}.title`),
                }))}
                value={form.values.appHref === null ? "existing" : "new"}
                onChange={(value) => {
                  if (value === "existing") {
                    form.setFieldValue("appId", null);
                    form.setFieldValue("appHref", null);
                  } else {
                    form.setFieldValue("appId", null);
                    form.setFieldValue("appHref", form.values.url);
                  }
                }}
              />
            )}

            {typeof form.values.appHref === "string" && canCreateApps ? (
              <TextInput
                placeholder={t("integration.field.appHref.placeholder")}
                withAsterisk
                label={t("integration.page.create.app.option.new.url.label")}
                description={t("integration.page.create.app.option.new.url.description")}
                {...form.getInputProps("appHref")}
              />
            ) : (
              <IntegrationAppSelect {...form.getInputProps("appId")} />
            )}
          </Stack>
        </Fieldset>
      </Collapse>
    </>
  );
};

type IntegrationAppSelectProps = Modify<
  GetInputPropsReturnType,
  {
    value?: string | null;
    onChange: (value: string | null) => void;
  }
>;

const IntegrationAppSelect = ({ value, ...props }: IntegrationAppSelectProps) => {
  const { data, isPending } = clientApi.app.selectable.useQuery();
  const t = useI18n();

  const appMap = new Map(data?.map((app) => [app.id, app] as const));

  return (
    <Select
      withAsterisk
      label={t("integration.page.create.app.option.existing.label")}
      searchable
      clearable
      leftSection={
        // eslint-disable-next-line @next/next/no-img-element
        value ? <img width={20} height={20} src={appMap.get(value)?.iconUrl} alt={appMap.get(value)?.name} /> : null
      }
      renderOption={({ option, checked }) => (
        <Group flex="1" gap="xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img width={20} height={20} src={appMap.get(option.value)?.iconUrl} alt={option.label} />
          <Stack gap={0}>
            <Text>{option.label}</Text>
            <Text size="xs" c="dimmed">
              {appMap.get(option.value)?.href}
            </Text>
          </Stack>
          {checked && (
            <IconCheck
              style={{ marginInlineStart: "auto" }}
              stroke={1.5}
              color="currentColor"
              opacity={0.6}
              size={18}
            />
          )}
        </Group>
      )}
      {...props}
      data={data?.map((app) => ({ value: app.id, label: app.name }))}
      rightSection={isPending ? <Loader size="sm" /> : null}
    />
  );
};
