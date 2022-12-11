import { Stack } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconKey, IconKeyOff, IconLock, IconLockOff, IconUser, IconUserOff } from '@tabler/icons';
import {
  IntegrationField,
  integrationFieldDefinitions,
  integrationFieldProperties,
  ServiceIntegrationPropertyType,
  ServiceType,
} from '../../../../../../../../types/service';
import { GenericSecretInput } from '../InputElements/GenericSecretInput';

interface IntegrationOptionsRendererProps {
  form: UseFormReturnType<ServiceType, (values: ServiceType) => ServiceType>;
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
          const type = Object.entries(integrationFieldDefinitions).find(
            ([k, v]) => k === property
          )![1].type;
          const newProperty: ServiceIntegrationPropertyType = {
            type,
            field: property as IntegrationField,
            isDefined: false,
          };
          form.insertListItem('integration.properties', newProperty);
          indexInFormValue = form.values.integration!.properties.length;
        }
        const formValue = form.values.integration?.properties[indexInFormValue];

        const isPresent = formValue?.isDefined;

        if (!definition) {
          return (
            <GenericSecretInput
              label={`${property} (potentionally unmapped)`}
              secretIsPresent={isPresent}
              setIcon={IconKey}
              unsetIcon={IconKeyOff}
              {...form.getInputProps(`integration.properties.${index}.value`)}
            />
          );
        }

        return (
          <GenericSecretInput
            label={definition.label}
            value=""
            secretIsPresent={isPresent}
            setIcon={definition.icon}
            unsetIcon={definition.iconUnset}
            {...form.getInputProps(`integration.properties.${index}.value`)}
          />
        );
      })}
    </Stack>
  );
};
