import { Checkbox, Popover, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useTranslation } from 'next-i18next';
import * as Modules from '../../modules';
import { IModule } from '../../modules/ModuleTypes';
import { useConfig } from '../../tools/state';

export default function ModuleEnabler(props: any) {
  const { t } = useTranslation('settings/general/module-enabler');
  const modules = Object.values(Modules).map((module) => module);
  return (
    <Stack>
      <Title order={4}>{t('title')}</Title>
      <SimpleGrid cols={3} spacing="xs">
        {modules.map((module) => (
          <ModuleToggle module={module} />
        ))}
      </SimpleGrid>
    </Stack>
  );
}

const ModuleToggle = ({ module }: { module: IModule }) => {
  const { config, setConfig } = useConfig();
  const { t: translationModules } = useTranslation(module.translationNamespace);
  const [opened, { close, open }] = useDisclosure(false);

  return (
    <Popover opened={opened} withArrow withinPortal width={200}>
      <Popover.Target>
        <div onMouseEnter={open} onMouseLeave={close}>
          <Checkbox
            key={module.title}
            size="md"
            checked={config.modules?.[module.title]?.enabled ?? false}
            label={translationModules('descriptor.name', {
              defaultValue: 'Unknown',
            })}
            onChange={(e) => {
              setConfig({
                ...config,
                modules: {
                  ...config.modules,
                  [module.title]: {
                    ...config.modules?.[module.title],
                    enabled: e.currentTarget.checked,
                  },
                },
              });
            }}
          />
        </div>
      </Popover.Target>
      <Popover.Dropdown>
        <Text weight="bold">{translationModules('descriptor.name')}</Text>
        <Text>{translationModules('descriptor.description')}</Text>
      </Popover.Dropdown>
    </Popover>
  );
};
