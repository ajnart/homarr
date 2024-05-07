import { Anchor, Button, Card, Collapse, Group, Stack, Tabs, Text, TextInput } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { IconClick, IconCursorText, IconLink } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { InfoCard } from '~/components/InfoCard/InfoCard';
import { AppType } from '~/types/app';

import { EditAppModalTab } from '../type';

interface GeneralTabProps {
  form: UseFormReturnType<AppType, (values: AppType) => AppType>;
  openTab: (tab: EditAppModalTab) => void;
}

export const GeneralTab = ({ form, openTab }: GeneralTabProps) => {
  const { t } = useTranslation('layout/modals/add-app');

  const [opened, { toggle }] = useDisclosure(false);

  const commonMistakes = [
    t('general.internalAddress.troubleshoot.lines.nothingAfterPort'),
    t('general.internalAddress.troubleshoot.lines.protocolCheck'),
    t('general.internalAddress.troubleshoot.lines.preferIP'),
    t('general.internalAddress.troubleshoot.lines.enablePings'),
    t('general.internalAddress.troubleshoot.lines.wget'),
    t('general.internalAddress.troubleshoot.lines.iframe'),
  ];

  return (
    <Tabs.Panel value="general" pt="sm">
      <Stack spacing="xs">
        <TextInput
          icon={<IconCursorText size={16} />}
          label={t('general.appname.label')}
          description={t('general.appname.description')}
          placeholder="My example app"
          variant="default"
          withAsterisk
          {...form.getInputProps('name')}
        />
        <TextInput
          icon={<IconLink size={16} />}
          label={t('general.internalAddress.label')}
          description={t('general.internalAddress.description')}
          placeholder="https://google.com"
          variant="default"
          withAsterisk
          {...form.getInputProps('url')}
          onChange={(e) => {
            form.setFieldValue('url', e.target.value);
          }}
        />
        <Stack style={{ gap: 0 }}>
          <Group style={{ gap: '0.25rem' }}>
            <Text size="0.875rem" weight={500}>
              {t('general.externalAddress.label')}
            </Text>
            <InfoCard message={t('general.externalAddress.tooltip')} />
          </Group>
          <TextInput
            icon={<IconClick size={16} />}
            description={t('general.externalAddress.description')}
            placeholder="https://homarr.mywebsite.com/"
            variant="default"
            {...form.getInputProps('behaviour.externalUrl')}
          />
        </Stack>

        <Collapse in={opened}>
          <Card withBorder>
            <Text>{t('general.internalAddress.troubleshoot.header')}</Text>
            {commonMistakes.map((value: string, key: number) => {
              return (
                <Group key={key} display="flex" style={{ alignItems: 'start' }}>
                  <Text>•</Text>
                  <Text style={{ flex: '1' }}>{value}</Text>
                </Group>
              );
            })}
            <Text>
              {t('general.internalAddress.troubleshoot.footer').split('{{discord}}')[0]}
              <Anchor href="https://discord.gg/aCsmEV5RgA" target="_blank">
                Discord
              </Anchor>
              {t('general.internalAddress.troubleshoot.footer').split('{{discord}}')[1]}
            </Text>
          </Card>
        </Collapse>

        {!form.values.behaviour.externalUrl.startsWith('https://') &&
          !form.values.behaviour.externalUrl.startsWith('http://') &&
          !form.values.behaviour.externalUrl.startsWith('[homarr_base]') &&
          !form.values.behaviour.externalUrl.startsWith('[homarr_protocol]://') && (
            <Text color="red" mt="sm" size="sm">
              {t('behaviour.customProtocolWarning')}
            </Text>
          )}
      </Stack>

      <Button onClick={toggle} bottom={-68} left={0} color="yellow.7" variant="light">
        {t('general.internalAddress.troubleshoot.label')}
      </Button>
    </Tabs.Panel>
  );
};
