import { Grid, Stack, Text } from '@mantine/core';
import { useTranslation } from 'next-i18next';

import widgets from '../../../../../../widgets';
import { SelectorBackArrow } from '../Shared/SelectorBackArrow';
import { WidgetElementType } from './WidgetElementType';

interface AvailableIntegrationElementsProps {
  onClickBack: () => void;
}

export const AvailableIntegrationElements = ({
  onClickBack,
}: AvailableIntegrationElementsProps) => {
  const { t } = useTranslation('layout/element-selector/selector');
  return (
    <Stack m="sm">
      <SelectorBackArrow onClickBack={onClickBack} />

      <Text mb="md" color="dimmed">
        {t('widgetDescription')}
      </Text>

      <Grid>
        {Object.entries(widgets).map(([k, v]) => (
          <WidgetElementType key={k} id={k} image={v.icon} widget={v} />
        ))}
      </Grid>
    </Stack>
  );
};
