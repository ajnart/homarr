import { Stack } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconKey, IconKeyOff, IconLock, IconLockOff, IconUser, IconUserOff } from '@tabler/icons';
import { ServiceType } from '../../../../../../../../../types/service';
import { GenericSecretInput } from '../InputElements/GenericSecretInput';

interface IntegrationOptionsRendererProps {
  form: UseFormReturnType<ServiceType, (values: ServiceType) => ServiceType>;
}

const secretMappings = [
  {
    label: 'username',
    prettyName: 'Username',
    icon: <IconUser size={18} />,
    iconUnset: <IconUserOff size={18} />,
  },
  {
    label: 'password',
    prettyName: 'Password',
    icon: <IconLock size={18} />,
    iconUnset: <IconLockOff size={18} />,
  },
  {
    label: 'apiKey',
    prettyName: 'API Key',
    icon: <IconKey size={18} />,
    iconUnset: <IconKeyOff size={18} />,
  },
];

export const IntegrationOptionsRenderer = ({ form }: IntegrationOptionsRendererProps) => (
  <Stack spacing="xs" mb="md">
    {Object.entries(form.values.integration.properties).map((entry) => {
      const mapping = secretMappings.find((item) => item.label === entry[0]);
      const isPresent = entry[1] !== undefined;

      if (!mapping) {
        return (
          <GenericSecretInput
            label={`${entry[0]} (potentionally unmapped)`}
            value={entry[1]}
            secretIsPresent={isPresent}
            setIcon={<IconKey size={18} />}
            unsetIcon={<IconKeyOff size={18} />}
          />
        );
      }

      return (
        <GenericSecretInput
          label={mapping.prettyName}
          value={entry[1]}
          secretIsPresent={isPresent}
          setIcon={mapping.icon}
          unsetIcon={mapping.iconUnset}
        />
      );
    })}
  </Stack>
);
