import { Grid, Text } from '@mantine/core';
import {
  IconArrowsUpDown,
  IconCalendarTime,
  IconClock,
  IconCloudRain,
  IconFileDownload,
} from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import widgets from '../../../../../../widgets';
import { GenericAvailableElementType } from '../Shared/GenericElementType';
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
    <>
      <SelectorBackArrow onClickBack={onClickBack} />

      <Text mb="md" color="dimmed">
        Widgets interact with your apps, to provide you with more control over your applications.
        They usually require a few configurations before use.
      </Text>

      <Grid>
        {Object.entries(widgets).map(([k, v]) => (
          <WidgetElementType key={k} id={k} image={v.icon} />
        ))}
      </Grid>
    </>
  );
};
