import { SelectItem } from '@mantine/core';
import { ContextModalProps, closeModal } from '@mantine/modals';
import { useConfigContext } from '~/config/provider';
import { useConfigStore } from '~/config/store';

import widgets from '../../../../widgets';
import { WidgetChangePositionModalInnerProps } from '../../Tiles/Widgets/WidgetsMenu';
import { useGridstackStore, useWrapperColumnCount } from '../../Wrappers/gridstack/store';
import { ChangePositionModal } from './ChangePositionModal';

export const ChangeWidgetPositionModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<WidgetChangePositionModalInnerProps>) => {
  const { name: configName } = useConfigContext();
  const updateConfig = useConfigStore((x) => x.updateConfig);
  const shapeSize = useGridstackStore((x) => x.currentShapeSize);

  if (shapeSize === null) {
    return null;
  }

  const handleSubmit = (x: number, y: number, width: number, height: number) => {
    if (!configName) {
      return;
    }

    updateConfig(
      configName,
      (prev) => {
        const currentWidget = prev.widgets.find((x) => x.id === innerProps.widgetId);
        currentWidget!.shape[shapeSize] = {
          location: {
            x,
            y,
          },
          size: {
            height,
            width,
          },
        };

        return {
          ...prev,
          widgets: [...prev.widgets.filter((x) => x.id !== innerProps.widgetId), currentWidget!],
        };
      },
      true
    );
    context.closeModal(id);
  };

  const handleCancel = () => {
    closeModal(id);
  };

  const widthData = useWidthData(innerProps.widgetType);
  const heightData = useHeightData(innerProps.widgetType);

  return (
    <ChangePositionModal
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      heightData={heightData}
      widthData={widthData}
      initialX={innerProps.widget.shape[shapeSize]?.location.x}
      initialY={innerProps.widget.shape[shapeSize]?.location.y}
      initialWidth={innerProps.widget.shape[shapeSize]?.size.width}
      initialHeight={innerProps.widget.shape[shapeSize]?.size.height}
    />
  );
};

const useWidthData = (integration: string): SelectItem[] => {
  const wrapperColumnCount = useWrapperColumnCount();
  const currentWidget = widgets[integration as keyof typeof widgets];
  if (!currentWidget) return [];
  const offset = currentWidget.gridstack.minWidth ?? 2;
  const length =
    (currentWidget.gridstack.maxWidth > wrapperColumnCount!
      ? wrapperColumnCount!
      : currentWidget.gridstack.maxWidth) - offset;
  return Array.from({ length: length + 1 }, (_, i) => i + offset).map((n) => ({
    value: n.toString(),
    // eslint-disable-next-line no-mixed-operators
    label: `${((100 / wrapperColumnCount!) * n).toFixed(2)}%`,
  }));
};

const useHeightData = (integration: string): SelectItem[] => {
  const mainAreaWidth = useGridstackStore((x) => x.mainAreaWidth);
  const wrapperColumnCount = useWrapperColumnCount();

  const currentWidget = widgets[integration as keyof typeof widgets];
  if (!currentWidget) return [];
  const offset = currentWidget.gridstack.minHeight ?? 2;
  const length = (currentWidget.gridstack.maxHeight ?? 12) - offset;
  return Array.from({ length }, (_, i) => i + offset).map((n) => ({
    value: n.toString(),
    label: `${(mainAreaWidth! / wrapperColumnCount!) * n}px`,
  }));
};
