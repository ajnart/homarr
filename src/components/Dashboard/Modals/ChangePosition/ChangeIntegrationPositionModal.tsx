import { SelectItem } from '@mantine/core';
import { closeModal, ContextModalProps } from '@mantine/modals';
import { useConfigContext } from '../../../../config/provider';
import { useConfigStore } from '../../../../config/store';
import { WidgetChangePositionModalInnerProps } from '../../Tiles/Widgets/WidgetsMenu';
import { Tiles } from '../../Tiles/tilesDefinitions';
import { ChangePositionModal } from './ChangePositionModal';
import widgets from '../../../../widgets';

export const ChangeIntegrationPositionModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<WidgetChangePositionModalInnerProps>) => {
  const { name: configName } = useConfigContext();
  const updateConfig = useConfigStore((x) => x.updateConfig);

  const handleSubmit = (x: number, y: number, width: number, height: number) => {
    if (!configName) {
      return;
    }

    updateConfig(configName, (prev) => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        [innerProps.integration]: {
          ...prev.widgets[innerProps.integration],
          shape: {
            location: {
              x,
              y,
            },
            size: {
              height,
              width,
            },
          },
        },
      },
    }));
    context.closeModal(id);
  };

  const handleCancel = () => {
    closeModal(id);
  };

  const widthData = useWidthData(innerProps.integration);
  const heightData = useHeightData(innerProps.integration);

  return (
    <ChangePositionModal
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      heightData={heightData}
      widthData={widthData}
      initialX={innerProps.widget.shape.location.x}
      initialY={innerProps.widget.shape.location.y}
      initialWidth={innerProps.widget.shape.size.width}
      initialHeight={innerProps.widget.shape.size.height}
    />
  );
};

const useWidthData = (integration: string): SelectItem[] => {
  const currentWidget = widgets[integration as keyof typeof widgets];
  if (!currentWidget) return [];
  const offset = currentWidget.gridstack.minWidth ?? 2;
  const length = (currentWidget.gridstack.maxWidth ?? 12) - offset;
  return Array.from({ length }, (_, i) => i + offset).map((n) => ({
    value: n.toString(),
    label: `${64 * n}px`,
  }));
};

const useHeightData = (integration: string): SelectItem[] => {
  const currentWidget = widgets[integration as keyof typeof widgets];
  if (!currentWidget) return [];
  const offset = currentWidget.gridstack.minHeight ?? 2;
  const length = (currentWidget.gridstack.maxHeight ?? 12) - offset;
  return Array.from({ length }, (_, i) => i + offset).map((n) => ({
    value: n.toString(),
    label: `${64 * n}px`,
  }));
};
