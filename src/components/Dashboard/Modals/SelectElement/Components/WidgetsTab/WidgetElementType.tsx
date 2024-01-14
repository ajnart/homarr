import { useModals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { Icon, IconChecks } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { v4 as uuidv4 } from 'uuid';
import { useConfigContext } from '~/config/provider';
import { useConfigStore } from '~/config/store';
import { IWidget, IWidgetDefinition } from '~/widgets/widgets';

import { useEditModeStore } from '../../../../Views/useEditModeStore';
import { GenericAvailableElementType } from '../Shared/GenericElementType';

interface WidgetElementTypeProps {
  id: string;
  image: string | Icon;
  disabled?: boolean;
  widget: IWidgetDefinition;
}

export const WidgetElementType = ({ id, image, disabled, widget }: WidgetElementTypeProps) => {
  const { closeModal } = useModals();
  const { t } = useTranslation(`modules/${id}`);
  const { name: configName, config } = useConfigContext();
  const updateConfig = useConfigStore((x) => x.updateConfig);
  const isEditMode = useEditModeStore((x) => x.enabled);

  if (!configName) return null;

  const getLowestWrapper = () => config?.wrappers.sort((a, b) => a.position - b.position)[0];

  const handleAddition = async () => {
    await updateConfig(
      configName,
      (prev) => ({
        ...prev,
        widgets: [
          ...prev.widgets,
          {
            id: uuidv4(),
            type: widget.id,
            properties: Object.entries(widget.options).reduce(
              (prev, [k, v]) => {
                const newPrev = prev;
                newPrev[k] = v.defaultValue;
                return newPrev;
              },
              {} as IWidget<string, any>['properties']
            ),
            area: {
              type: 'wrapper',
              properties: {
                id: getLowestWrapper()?.id ?? '',
              },
            },
            shape: {
              sm: {
                location: {
                  x: 0,
                  y: 0,
                },
                size: {
                  width: widget.gridstack.minWidth,
                  height: widget.gridstack.minHeight,
                },
              },
              md: {
                location: {
                  x: 0,
                  y: 0,
                },
                size: {
                  width: widget.gridstack.minWidth,
                  height: widget.gridstack.minHeight,
                },
              },
              lg: {
                location: {
                  x: 0,
                  y: 0,
                },
                size: {
                  width: widget.gridstack.minWidth,
                  height: widget.gridstack.minHeight,
                },
              },
            },
          },
        ],
      }),
      true,
      !isEditMode
    );
    closeModal('selectElement');
    showNotification({
      title: t('descriptor.name'),
      message: t('descriptor.description'),
      icon: <IconChecks stroke={1.5} />,
      color: 'teal',
    });
    umami.track('Add widget', { id: widget.id });
  };

  return (
    <GenericAvailableElementType
      name={t('descriptor.name')}
      description={t('descriptor.description') ?? undefined}
      image={image}
      id={widget.id}
      disabled={disabled}
      handleAddition={handleAddition}
    />
  );
};
