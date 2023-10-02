import { type SelectItem } from '@mantine/core';
import { type ContextModalProps, closeModal } from '@mantine/modals';
import { type AppItem } from '~/components/Board/context';
import { type useResizeGridItem } from '~/components/Board/gridstack/useResizeGridItem';
import { useItemActions } from '~/components/Board/item-actions';

import { useGridstackStore, useWrapperColumnCount } from '../../Wrappers/gridstack/store';
import { ChangePositionModal } from './ChangePositionModal';

type ChangeAppPositionModalInnerProps = {
  app: AppItem;
  boardName: string;
  resizeGridItem: ReturnType<typeof useResizeGridItem>;
};

export const ChangeAppPositionModal = ({
  id,
  context,
  innerProps,
}: ContextModalProps<ChangeAppPositionModalInnerProps>) => {
  const { moveAndResizeItem } = useItemActions({ boardName: innerProps.boardName });

  const handleSubmit = (x: number, y: number, width: number, height: number) => {
    moveAndResizeItem({
      itemId: innerProps.app.id,
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

  const widthData = useWidthData();
  const heightData = useHeightData();

  return (
    <ChangePositionModal
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      widthData={widthData}
      heightData={heightData}
      initialX={innerProps.app.x}
      initialY={innerProps.app.y}
      initialWidth={innerProps.app.width}
      initialHeight={innerProps.app.height}
    />
  );
};

const useHeightData = (): SelectItem[] => {
  const mainAreaWidth = useGridstackStore((x) => x.mainAreaWidth);
  const wrapperColumnCount = useWrapperColumnCount();

  return Array.from(Array(11).keys()).map((n) => {
    const index = n + 1;
    return {
      value: index.toString(),
      label: `${Math.floor(index * (mainAreaWidth! / wrapperColumnCount!))}px`,
    };
  });
};

const useWidthData = (): SelectItem[] => {
  const wrapperColumnCount = useWrapperColumnCount();
  return Array.from(Array(wrapperColumnCount!).keys()).map((n) => {
    const index = n + 1;
    return {
      value: index.toString(),
      // eslint-disable-next-line no-mixed-operators
      label: `${((100 / wrapperColumnCount!) * index).toFixed(2)}%`,
    };
  });
};
