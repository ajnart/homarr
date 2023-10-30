import { SelectItem } from '@mantine/core';
import { ContextModalProps, closeModal } from '@mantine/modals';
import { useConfigContext } from '~/config/provider';
import { useConfigStore } from '~/config/store';
import { AppType } from '~/types/app';

import { useGridstackStore, useWrapperColumnCount } from '../../Wrappers/gridstack/store';
import { ChangePositionModal } from './ChangePositionModal';

type ChangeAppPositionModalInnerProps = {
  app: AppType;
};

export const ChangeAppPositionModal = ({
  id,
  context,
  innerProps,
}: ContextModalProps<ChangeAppPositionModalInnerProps>) => {
  const { name: configName } = useConfigContext();
  const updateConfig = useConfigStore((x) => x.updateConfig);
  const shapeSize = useGridstackStore((x) => x.currentShapeSize);

  if (!shapeSize) return null;

  const handleSubmit = (x: number, y: number, width: number, height: number) => {
    if (!configName) {
      return;
    }

    updateConfig(
      configName,
      (previousConfig) => ({
        ...previousConfig,
        apps: [
          ...previousConfig.apps.filter((x) => x.id !== innerProps.app.id),
          {
            ...innerProps.app,
            shape: {
              ...innerProps.app.shape,
              [shapeSize]: { location: { x, y }, size: { width, height } },
            },
          },
        ],
      }),
      true
    );
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
      initialX={innerProps.app.shape[shapeSize]?.location.x}
      initialY={innerProps.app.shape[shapeSize]?.location.y}
      initialWidth={innerProps.app.shape[shapeSize]?.size.width}
      initialHeight={innerProps.app.shape[shapeSize]?.size.height}
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
