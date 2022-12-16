import { SelectItem } from '@mantine/core';
import { closeModal, ContextModalProps } from '@mantine/modals';
import { useConfigContext } from '../../../../config/provider';
import { useConfigStore } from '../../../../config/store';
import { IntegrationsType } from '../../../../types/integration';
import { IntegrationChangePositionModalInnerProps } from '../../Tiles/Integrations/IntegrationsMenu';
import { Tiles } from '../../Tiles/tilesDefinitions';
import { ChangePositionModal } from './ChangePositionModal';

export const ChangeIntegrationPositionModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<IntegrationChangePositionModalInnerProps>) => {
  const { name: configName } = useConfigContext();
  const updateConfig = useConfigStore((x) => x.updateConfig);

  const handleSubmit = (x: number, y: number, width: number, height: number) => {
    if (!configName) {
      return;
    }

    updateConfig(configName, (prev) => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [innerProps.integration]: {
          ...prev.integrations[innerProps.integration],
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
      initialX={innerProps.module.shape.location.x}
      initialY={innerProps.module.shape.location.y}
      initialWidth={innerProps.module.shape.size.width}
      initialHeight={innerProps.module.shape.size.height}
    />
  );
};

const useWidthData = (integration: keyof IntegrationsType): SelectItem[] => {
  const tileDefinitions = Tiles[integration];
  const offset = tileDefinitions.minWidth ?? 2;
  const length = (tileDefinitions.maxWidth ?? 12) - offset;
  return Array.from({ length }, (_, i) => i + offset).map((n) => ({
    value: n.toString(),
    label: `${64 * n}px`,
  }));
};

const useHeightData = (integration: keyof IntegrationsType): SelectItem[] => {
  const tileDefinitions = Tiles[integration];
  const offset = tileDefinitions.minHeight ?? 2;
  const length = (tileDefinitions.maxHeight ?? 12) - offset;
  return Array.from({ length }, (_, i) => i + offset).map((n) => ({
    value: n.toString(),
    label: `${64 * n}px`,
  }));
};
