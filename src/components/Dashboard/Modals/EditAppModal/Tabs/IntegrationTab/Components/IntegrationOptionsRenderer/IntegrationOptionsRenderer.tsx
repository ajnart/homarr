import { Stack } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconKey } from '@tabler/icons-react';
import {
  AppIntegrationPropertyType,
  AppType,
  IntegrationField,
  integrationFieldDefinitions,
  integrationFieldProperties,
} from '~/types/app';

import { GenericSecretInput } from '../InputElements/GenericSecretInput';

interface IntegrationOptionsRendererProps {
  form: UseFormReturnType<AppType, (values: AppType) => AppType>;
}

export const IntegrationOptionsRenderer = ({ form }: IntegrationOptionsRendererProps) => {
  const selectedIntegration = form.values.integration?.type;

  if (!selectedIntegration) return null;

  const displayedProperties = integrationFieldProperties[selectedIntegration];

  return (
    <Stack spacing="xs" mb="md">
      {displayedProperties.map((property, index) => {
        const [_, definition] = Object.entries(integrationFieldDefinitions).find(
          ([key]) => property === key
        )!;

        let indexInFormValue =
          form.values.integration?.properties.findIndex((p) => p.field === property) ?? -1;
        if (indexInFormValue === -1) {
          const { type } = Object.entries(integrationFieldDefinitions).find(
            ([k, v]) => k === property
          )![1];
          const newProperty: AppIntegrationPropertyType = {
            type,
            field: property as IntegrationField,
            isDefined: false,
          };
          form.insertListItem('integration.properties', newProperty);
          indexInFormValue = form.values.integration!.properties.length;
        }
        const formValue = form.values.integration?.properties[indexInFormValue];

        const isPresent = formValue?.isDefined;
        const accessabilityType = formValue?.type;

        if (!definition) {
          return (
            <GenericSecretInput
              onClickUpdateButton={(value) => {
                form.setFieldValue(`integration.properties.${index}.value`, value);
                form.setFieldValue(
                  `integration.properties.${index}.isDefined`,
                  value !== undefined
                );
              }}
              key={`input-${property}`}
              label={`${property} (potentionally unmapped)`}
              secretIsPresent={isPresent}
              setIcon={IconKey}
              type={accessabilityType}
              {...form.getInputProps(`integration.properties.${index}.value`)}
            />
          );
        }

        return (
          <GenericSecretInput
            onClickUpdateButton={(value) => {
              form.setFieldValue(`integration.properties.${index}.value`, value);
              form.setFieldValue(`integration.properties.${index}.isDefined`, value !== undefined);
            }}
            key={`input-${definition.label}`}
            label={definition.label}
            secretIsPresent={isPresent}
            setIcon={definition.icon}
            type={accessabilityType}
            {...form.getInputProps(`integration.properties.${index}.value`)}
          />
        );
      })}
    </Stack>
  );
};
