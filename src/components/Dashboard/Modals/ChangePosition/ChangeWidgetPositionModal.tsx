import { SelectItem } from '@mantine/core';
import { ContextModalProps, closeModal } from '@mantine/modals';
import { useItemActions } from '~/components/Board/item-actions';

import widgets from '../../../../widgets';
import { WidgetChangePositionModalInnerProps } from '../../Tiles/Widgets/WidgetsMenu';
import { useGridstackStore, useWrapperColumnCount } from '../../Wrappers/gridstack/store';
import { ChangePositionModal } from './ChangePositionModal';

export const ChangeWidgetPositionModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<WidgetChangePositionModalInnerProps>) => {
  const { moveAndResizeItem } = useItemActions({ boardName: innerProps.boardName });

  const handleSubmit = (x: number, y: number, width: number, height: number) => {
    moveAndResizeItem({
      itemId: innerProps.widget.id,
      x,
      y,
      width,
      height,
    });
    innerProps.resizeGridItem({ x: x, y: y, w: width, h: height });

    context.closeModal(id);
  };

  const handleCancel = () => {
    closeModal(id);
  };

  const widthData = useWidthData(innerProps.widget.sort);
  const heightData = useHeightData(innerProps.widget.sort);

  return (
    <ChangePositionModal
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      heightData={heightData}
      widthData={widthData}
      initialX={innerProps.widget.x}
      initialY={innerProps.widget.y}
      initialWidth={innerProps.widget.width}
      initialHeight={innerProps.widget.height}
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
