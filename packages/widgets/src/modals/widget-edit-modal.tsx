"use client";

import { useState } from "react";
import { Button, Group, Stack } from "@mantine/core";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod/v4";

import { objectEntries } from "@homarr/common";
import type { WidgetKind } from "@homarr/definitions";
import { createModal, useModalAction } from "@homarr/modals";
import type { SettingsContextProps } from "@homarr/settings/creator";
import { useI18n } from "@homarr/translation/client";
import { zodErrorMap } from "@homarr/validation/form/i18n";

import { widgetImports } from "..";
import { getInputForType } from "../_inputs";
import { FormProvider, useForm } from "../_inputs/form";
import type { BoardItemAdvancedOptions } from "../../../validation/src/shared";
import type { OptionsBuilderResult } from "../options";
import type { IntegrationSelectOption } from "../widget-integration-select";
import { WidgetIntegrationSelect } from "../widget-integration-select";
import { WidgetAdvancedOptionsModal } from "./widget-advanced-options-modal";

export interface WidgetEditModalState {
  options: Record<string, unknown>;
  integrationIds: string[];
  advancedOptions: BoardItemAdvancedOptions;
}

interface ModalProps<TSort extends WidgetKind> {
  kind: TSort;
  value: WidgetEditModalState;
  onSuccessfulEdit: (value: WidgetEditModalState) => void;
  integrationData: IntegrationSelectOption[];
  integrationSupport: boolean;
  settings: SettingsContextProps;
}

export const WidgetEditModal = createModal<ModalProps<WidgetKind>>(({ actions, innerProps }) => {
  const t = useI18n();
  const [advancedOptions, setAdvancedOptions] = useState<BoardItemAdvancedOptions>(innerProps.value.advancedOptions);

  // Translate the error messages
  z.config({
    customError: zodErrorMap(t),
  });
  const { definition } = widgetImports[innerProps.kind];
  const options = definition.createOptions(innerProps.settings) as Record<string, OptionsBuilderResult[string]>;

  const form = useForm({
    mode: "controlled",
    initialValues: innerProps.value,
    validate: zod4Resolver(
      z.object({
        options: z.object(
          objectEntries(options).reduce(
            (acc, [key, value]: [string, { type: string; validate?: z.ZodType<unknown> }]) => {
              if (value.validate) {
                acc[key] = value.type === "multiText" ? z.array(value.validate).optional() : value.validate;
              }

              return acc;
            },
            {} as Record<string, z.ZodType<unknown>>,
          ),
        ),
        integrationIds: z.array(z.string()),
        advancedOptions: z.object({
          customCssClasses: z.array(z.string()),
          borderColor: z.string(),
        }),
      }),
    ),
    validateInputOnBlur: true,
    validateInputOnChange: true,
  });
  const { openModal } = useModalAction(WidgetAdvancedOptionsModal);

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        innerProps.onSuccessfulEdit({
          ...values,
          advancedOptions,
        });
        actions.closeModal();
      })}
    >
      <FormProvider form={form}>
        <Stack>
          {innerProps.integrationSupport && (
            <WidgetIntegrationSelect
              label={t("item.edit.field.integrations.label")}
              data={innerProps.integrationData}
              {...form.getInputProps("integrationIds")}
            />
          )}
          {Object.entries(options).map(([key, value]) => {
            const Input = getInputForType(value.type);

            if (
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              !Input ||
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              value.shouldHide?.(
                form.values.options as never,
                innerProps.integrationData
                  .filter(({ id }) => form.values.integrationIds.includes(id))
                  .map(({ kind }) => kind),
              )
            ) {
              return null;
            }

            return (
              <Input
                key={key}
                kind={innerProps.kind}
                property={key}
                options={value as never}
                initialOptions={innerProps.value.options}
              />
            );
          })}
          <Group justify="space-between">
            <Button
              variant="subtle"
              onClick={() =>
                openModal({
                  advancedOptions,
                  onSuccess(options) {
                    setAdvancedOptions(options);
                    innerProps.onSuccessfulEdit({
                      ...innerProps.value,
                      advancedOptions: options,
                    });
                  },
                })
              }
            >
              {t("item.edit.advancedOptions.label")}
            </Button>
            <Group justify="end" w={{ base: "100%", xs: "auto" }}>
              <Button onClick={actions.closeModal} variant="subtle" color="gray">
                {t("common.action.cancel")}
              </Button>
              <Button type="submit">{t("common.action.saveChanges")}</Button>
            </Group>
          </Group>
        </Stack>
      </FormProvider>
    </form>
  );
}).withOptions({
  keepMounted: true,
  defaultTitle(t) {
    return t("item.edit.title");
  },
  size: "lg",
});
