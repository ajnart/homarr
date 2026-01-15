import { useCallback } from "react";
import { SegmentedControl } from "@mantine/core";

import type { IntegrationSecretKind } from "@homarr/definitions";
import type { UseFormReturnType } from "@homarr/form";
import { useScopedI18n } from "@homarr/translation/client";

interface FormType {
  secrets: { kind: IntegrationSecretKind; value: string | null }[];
}

interface SecretKindsSegmentedControlProps<TFormType extends FormType> {
  defaultKinds?: IntegrationSecretKind[];
  secretKinds: IntegrationSecretKind[][];
  form: UseFormReturnType<TFormType, (values: TFormType) => TFormType>;
}

export const SecretKindsSegmentedControl = <TFormType extends FormType>({
  defaultKinds,
  secretKinds,
  form,
}: SecretKindsSegmentedControlProps<TFormType>) => {
  const t = useScopedI18n("integration.secrets");

  const defaultValue = defaultKinds?.length === 0 ? "empty" : defaultKinds?.join("-");
  const secretKindGroups = secretKinds.map((kinds) => ({
    label:
      kinds.length === 0
        ? t("noSecretsRequired.segmentTitle")
        : kinds.map((kind) => t(`kind.${kind}.label`)).join(" & "),
    value: kinds.length === 0 ? "empty" : kinds.join("-"),
  }));

  const onChange = useCallback(
    (value: string) => {
      if (value === "empty") {
        const emptyValues = [] satisfies FormType["secrets"];
        // @ts-expect-error somehow it is not able to understand that secrets is an array?
        form.setFieldValue("secrets", emptyValues);
        return;
      }

      const kinds = value.split("-") as IntegrationSecretKind[];
      const secrets = kinds.map((kind) => ({
        kind,
        value: "",
      })) satisfies FormType["secrets"];
      // @ts-expect-error somehow it is not able to understand that secrets is an array?
      form.setFieldValue("secrets", secrets);
    },
    [form],
  );

  return (
    <SegmentedControl
      fullWidth
      data={secretKindGroups}
      defaultValue={defaultValue}
      onChange={onChange}
    ></SegmentedControl>
  );
};
