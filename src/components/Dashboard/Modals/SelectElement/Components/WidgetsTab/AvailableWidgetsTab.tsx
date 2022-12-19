import { Grid, Text } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '../../../../../../config/provider';
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
  const activeWidgets = useConfigContext().config?.widgets ?? [];
  return (
    <>
      <SelectorBackArrow onClickBack={onClickBack} />

      <Text mb="md" color="dimmed">
        Widgets interact with your apps, to provide you with more control over your applications.
        They usually require a few configurations before use.
      </Text>

      <Grid>
        {Object.entries(widgets)
          .filter(([widgetId]) => !activeWidgets.some((aw) => aw.id === widgetId))
          .map(([k, v]) => (
            <WidgetElementType key={k} id={k} image={v.icon} widget={v} />
          ))}
      </Grid>
    </>
  );
};
