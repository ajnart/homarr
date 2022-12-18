import { SelectItem } from '@mantine/core';
import { closeModal, ContextModalProps } from '@mantine/modals';
import { useConfigContext } from '../../../../config/provider';
import { useConfigStore } from '../../../../config/store';
import { AppType } from '../../../../types/app';
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

  const handleSubmit = (x: number, y: number, width: number, height: number) => {
    if (!configName) {
      return;
    }

    updateConfig(configName, (previousConfig) => ({
      ...previousConfig,
      apps: [
        ...previousConfig.apps.filter((x) => x.id !== innerProps.app.id),
        { ...innerProps.app, shape: { location: { x, y }, size: { width, height } } },
      ],
    }));
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
      initialX={innerProps.app.shape.location.x}
      initialY={innerProps.app.shape.location.y}
      initialWidth={innerProps.app.shape.size.width}
      initialHeight={innerProps.app.shape.size.height}
    />
  );
};

const useHeightData = (): SelectItem[] =>
  Array.from(Array(11).keys()).map((n) => {
    const index = n + 1;
    return {
      value: index.toString(),
      label: `${64 * index}px`,
    };
  });

const useWidthData = (): SelectItem[] =>
  Array.from(Array(11).keys()).map((n) => {
    const index = n + 1;
    return {
      value: index.toString(),
      label: `${64 * index}px`,
    };
  });
