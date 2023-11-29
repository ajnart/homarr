import { type SelectItem } from '@mantine/core';
import { type ContextModalProps, closeModal } from '@mantine/modals';
import { useItemActions } from '~/components/Board/Items/item-actions';
import { type WidgetItem } from '~/components/Board/context';
import { type useResizeGridItem } from '~/components/Board/gridstack/useResizeGridItem';

import widgets from '../../../../widgets';
import { useGridstackStore, useWrapperColumnCount } from '../../gridstack/store';
import { CommonChangePositionModal } from '../CommonChangePositionModal';

export type WidgetChangePositionModalInnerProps = {
  widget: WidgetItem;
  wrapperColumnCount: number;
  resizeGridItem: ReturnType<typeof useResizeGridItem>;
};

export const ChangeWidgetPositionModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<WidgetChangePositionModalInnerProps>) => {
  const { moveAndResizeItem } = useItemActions();

  const handleSubmit = (x: number, y: number, width: number, height: number) => {
    moveAndResizeItem({
      itemId: innerProps.widget.id,
      x,
      y,
      width,
      height,
    });
    innerProps.resizeGridItem({ x, y, width, height });

    context.closeModal(id);
  };

  const handleCancel = () => {
    closeModal(id);
  };

  const widthData = useWidthData(innerProps.widget.sort);
  const heightData = useHeightData(innerProps.widget.sort);

  return (
    <CommonChangePositionModal
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
