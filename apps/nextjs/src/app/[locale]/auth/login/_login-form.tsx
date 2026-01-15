"use client";

import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Anchor, Button, Card, Code, Collapse, Divider, PasswordInput, Stack, Text, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { z } from "zod/v4";

import { signIn } from "@homarr/auth/client";
import { revalidatePathActionAsync } from "@homarr/common/client";
import type { useForm } from "@homarr/form";
import { useZodForm } from "@homarr/form";
import { showErrorNotification, showSuccessNotification } from "@homarr/notifications";
import { useScopedI18n } from "@homarr/translation/client";
import { userSignInSchema } from "@homarr/validation/user";

type Provider = "credentials" | "ldap" | "oidc";

interface LoginFormProps {
  providers: string[];
  oidcClientName: string;
  isOidcAutoLoginEnabled: boolean;
  callbackUrl: string;
}

const extendedValidation = userSignInSchema.extend({ provider: z.enum(["credentials", "ldap"]) });

export const LoginForm = ({ providers, oidcClientName, isOidcAutoLoginEnabled, callbackUrl }: LoginFormProps) => {
  const t = useScopedI18n("user");
  const searchParams = useSearchParams();
  const isError = searchParams.has("error");
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const form = useZodForm(extendedValidation, {
    initialValues: {
      name: "",
      password: "",
      provider: "credentials",
    },
  });

  const credentialInputsVisible = providers.includes("credentials") || providers.includes("ldap");

  const onSuccess = useCallback(
    async (provider: Provider, response: Awaited<ReturnType<typeof signIn>>) => {
      if (!response.ok || response.error) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw response.error;
      }

      if (provider === "oidc") {
        if (!response.url) {
          showErrorNotification({
            title: t("action.login.notification.error.title"),
            message: t("action.login.notification.error.message"),
            autoClose: 10000,
          });
          return;
        }

        router.push(response.url);
        return;
      }

      showSuccessNotification({
        title: t("action.login.notification.success.title"),
        message: t("action.login.notification.success.message"),
      });

      // Redirect to the callback URL if the response is defined and comes from a credentials provider (ldap or credentials). oidc is redirected automatically.
      await revalidatePathActionAsync("/");
      router.push(callbackUrl);
    },
    [t, router, callbackUrl],
  );

  const onError = useCallback(() => {
    setIsPending(false);

    showErrorNotification({
      title: t("action.login.notification.error.title"),
      message: t("action.login.notification.error.message"),
      autoClose: 10000,
    });
  }, [t]);

  const signInAsync = useCallback(
    async (provider: Provider, options?: Parameters<typeof signIn>[1]) => {
      setIsPending(true);
      await signIn(provider, {
        ...options,
        redirect: false,
        callbackUrl: new URL(callbackUrl, window.location.href).href,
      })
        .then((response) => onSuccess(provider, response))
        .catch(onError);
    },
    [setIsPending, onSuccess, onError, callbackUrl],
  );

  const isLoginInProgress = useRef(false);

  useEffect(() => {
    if (isError) return;
    if (isOidcAutoLoginEnabled && !isPending && !isLoginInProgress.current) {
      isLoginInProgress.current = true;
      void signInAsync("oidc");
    }
  }, [signInAsync, isOidcAutoLoginEnabled, isPending, isError]);

  return (
    <Stack gap="xl">
      <Stack gap="lg">
        {credentialInputsVisible && (
          <>
            <form onSubmit={form.onSubmit((credentials) => void signInAsync(credentials.provider, credentials))}>
              <Stack gap="lg">
                <TextInput
                  label={t("field.username.label")}
                  id="username"
                  autoComplete="username"
                  {...form.getInputProps("name")}
                />
                <PasswordInput
                  label={t("field.password.label")}
                  id="password"
                  autoComplete="current-password"
                  {...form.getInputProps("password")}
                />

                {providers.includes("credentials") && (
                  <Stack gap="sm">
                    <SubmitButton isPending={isPending} form={form} provider="credentials">
                      {t("action.login.label")}
                    </SubmitButton>
                    <PasswordForgottenCollapse username={form.values.name} />
                  </Stack>
                )}

                {providers.includes("ldap") && (
                  <SubmitButton isPending={isPending} form={form} provider="ldap">
                    {t("action.login.labelWith", { provider: "LDAP" })}
                  </SubmitButton>
                )}
              </Stack>
            </form>
            {providers.includes("oidc") && <Divider label="OIDC" labelPosition="center" />}
          </>
        )}

        {providers.includes("oidc") && (
          <Button fullWidth variant="light" onClick={async () => await signInAsync("oidc")}>
            {t("action.login.labelWith", { provider: oidcClientName })}
          </Button>
        )}
      </Stack>
    </Stack>
  );
};

interface SubmitButtonProps {
  isPending: boolean;
  form: ReturnType<typeof useForm<FormType, (values: FormType) => FormType>>;
  provider: "credentials" | "ldap";
}

const SubmitButton = ({ isPending, form, provider, children }: PropsWithChildren<SubmitButtonProps>) => {
  const isCurrentProviderActive = form.getValues().provider === provider;

  return (
    <Button
      type="submit"
      name={provider}
      fullWidth
      onClick={() => form.setFieldValue("provider", provider)}
      loading={isPending && isCurrentProviderActive}
      disabled={isPending && !isCurrentProviderActive}
    >
      {children}
    </Button>
  );
};

interface PasswordForgottenCollapseProps {
  username: string;
}
const PasswordForgottenCollapse = ({ username }: PasswordForgottenCollapseProps) => {
  const [visible, { toggle }] = useDisclosure(false);
  const tForgotPassword = useScopedI18n("user.action.login.forgotPassword");

  const commandUsername = username.trim().length >= 1 ? username.trim() : "<username>";

  return (
    <>
      <Anchor type="button" component="button" onClick={toggle}>
        {tForgotPassword("label")}
      </Anchor>

      <Collapse in={visible}>
        <Card>
          <Stack gap="xs">
            <Text size="sm">{tForgotPassword("description")}</Text>

            <Code>homarr reset-password -u {commandUsername}</Code>
          </Stack>
        </Card>
      </Collapse>
    </>
  );
};

type FormType = z.infer<typeof extendedValidation>;
