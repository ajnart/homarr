import { SelectItem } from '@mantine/core';
import { closeModal, ContextModalProps } from '@mantine/modals';
import { useConfigContext } from '../../../../config/provider';
import { useConfigStore } from '../../../../config/store';
import { ServiceType } from '../../../../types/service';
import { ChangePositionModal } from './ChangePositionModal';

type ChangeServicePositionModalInnerProps = {
  service: ServiceType;
};

export const ChangeServicePositionModal = ({
  id,
  context,
  innerProps,
}: ContextModalProps<ChangeServicePositionModalInnerProps>) => {
  const { name: configName } = useConfigContext();
  const updateConfig = useConfigStore((x) => x.updateConfig);

  const handleSubmit = (x: number, y: number, width: number, height: number) => {
    if (!configName) {
      return;
    }

    updateConfig(configName, (previousConfig) => ({
      ...previousConfig,
      services: [
        ...previousConfig.services.filter((x) => x.id !== innerProps.service.id),
        { ...innerProps.service, shape: { location: { x, y }, size: { width, height } } },
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
      initialX={innerProps.service.shape.location.x}
      initialY={innerProps.service.shape.location.y}
      initialWidth={innerProps.service.shape.size.width}
      initialHeight={innerProps.service.shape.size.height}
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
