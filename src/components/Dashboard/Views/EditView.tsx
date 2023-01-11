import { ActionIcon, Affix, Group, Paper, Progress, Stack, Text } from '@mantine/core';
import { IconQuestionMark } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { useNamedWrapperColumnCount, useWrapperColumnCount } from '../Wrappers/gridstack/store';
import { DashboardView } from './DashboardView';

export const DashboardEditView = () => {
  const wrapperColumnCount = useWrapperColumnCount();
  const namedWrapperColumnCount = useNamedWrapperColumnCount();
  const widthInTotal = ((wrapperColumnCount ?? 0) / 12) * 100;

  const { t } = useTranslation('layout/screen-sizes');

  const translatedSize = t(`sizes.${namedWrapperColumnCount}`);

  return (
    <>
      <Affix position={{ bottom: 20, right: 20 }} style={{ width: 250 }} withinPortal>
        <Paper p="sm" withBorder>
          <Group position="apart" align="start">
            <Stack spacing={0} mb="sm" style={{ maxWidth: 175 }}>
              <Text size="xs" weight="bold">
                {t('popover.title', { size: translatedSize })}
              </Text>
              <Text size="xs" color="dimmed">
                {t('popover.description')}
              </Text>
            </Stack>

            <ActionIcon size="sm">
              <IconQuestionMark size={16} />
            </ActionIcon>
          </Group>
          <Progress size="xl" value={widthInTotal} label={translatedSize} />
        </Paper>
      </Affix>
      <DashboardView />
    </>
  );
};
