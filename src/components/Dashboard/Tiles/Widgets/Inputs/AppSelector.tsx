import { Group, Select, Text } from '@mantine/core';
import { useConfigContext } from '~/config/provider';
import { IntegrationType } from '~/types/app';
import { AppAvatar } from '~/components/AppAvatar';
import { ComponentProps, forwardRef } from 'react';

export type AppSelectorProps = {
  value: string;
  onChange: (value: string) => void;
  integrations: IntegrationType[];
  selectProps?: Omit<ComponentProps<typeof Select>, 'value' | 'data' | 'onChange'>;
}

export function AppSelector(props: AppSelectorProps) {
  const { value, integrations, onChange } = props;
  const { config } = useConfigContext();

  const apps = config?.apps.filter((app) => app.integration.type && integrations.includes(app.integration.type)) ?? [];
  const selectedApp = apps.find(app => app.id === value);

  return (
    <Select
      value={value}
      data={apps.map(app => ({
        value: app.id,
        label: app.name,
      }))}
      onChange={onChange}
      icon={selectedApp ? <AppAvatar iconUrl={selectedApp?.appearance.iconUrl} /> : undefined}
      itemComponent={forwardRef(({ value, label, ...rest }, ref) => {
        const app = apps.find(app => app.id === value);

        if (!app) {
          return null;
        }

        return (
          <Group ref={ref} {...rest}>
            <AppAvatar iconUrl={app.appearance.iconUrl} />
            <Text size="xs">
              {label}
            </Text>
          </Group>
        );
      })}
      nothingFound="No apps found"
    />
  );
}
