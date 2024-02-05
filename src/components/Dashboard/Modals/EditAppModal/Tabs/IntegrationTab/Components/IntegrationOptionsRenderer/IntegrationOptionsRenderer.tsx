import { Stack } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconKey } from '@tabler/icons-react';
import {
  AppIntegrationPropertyType,
  AppType,
  integrationFieldDefinitions,
  integrationFieldProperties
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
          ([key]) => property.type === key
        )!;

        let indexInFormValue =
          form.values.integration?.properties.findIndex((p) => p.field === property.type) ?? -1;
        if (indexInFormValue === -1) {
          const { type } = Object.entries(integrationFieldDefinitions).find(
            ([k, v]) => k === property.type
          )![1];
          const newProperty: AppIntegrationPropertyType = {
            type,
            field: property.type ,
            isDefined: false,
          };
          form.insertListItem('integration.properties', newProperty);
          indexInFormValue = form.values.integration!.properties.length;
        }
        const formValue = form.values.integration?.properties[indexInFormValue];

        const isPresent = formValue?.isDefined;
        const accessabilityType = formValue?.type;
        console.log(`index: ${index}, indexInFormValue: ${indexInFormValue}, isPresent: ${isPresent}, accessabilityType: ${accessabilityType}`)


        if (!definition) {
          return (
            <GenericSecretInput
              required={property.isRequired} 
              onClickUpdateButton={(value) => {
                form.setFieldValue(`integration.properties.${indexInFormValue}.value`, value);
                form.setFieldValue(
                  `integration.properties.${indexInFormValue}.isDefined`,
                  value !== undefined
                );
              } }
              key={`input-${property}`}
              label={`${property} (potentionally unmapped)`}
              secretIsPresent={isPresent}
              setIcon={IconKey}
              type={accessabilityType}
              {...form.getInputProps(`integration.properties.${indexInFormValue}.value`)}            />
          );
        }

        return (
          <GenericSecretInput
          required={property.isRequired} 
            onClickUpdateButton={(value) => {
              form.setFieldValue(`integration.properties.${indexInFormValue}.value`, value);
              form.setFieldValue(`integration.properties.${indexInFormValue}.isDefined`, value !== undefined);
            }}
            key={`input-${definition.label}`}
            label={definition.label}
            secretIsPresent={isPresent}
            setIcon={definition.icon}
            type={accessabilityType}
            {...form.getInputProps(`integration.properties.${indexInFormValue}.value`)}
          />
        );
      })}
    </Stack>
  );
};
