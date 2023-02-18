import { ReactNode, useEffect } from 'react';
import Widgets from '.';
import { HomarrCardWrapper } from '../components/Dashboard/Tiles/HomarrCardWrapper';
import { WidgetsMenu } from '../components/Dashboard/Tiles/Widgets/WidgetsMenu';
import { useConfigContext } from '../config/provider';
import { useConfigStore } from '../config/store';
import { IWidget } from './widgets';

interface WidgetWrapperProps {
  widgetId: string;
  widget: IWidget<string, any>;
  className: string;
  children: ReactNode;
}

// If a property has no value, set it to the default value
const useSetDefaultProps = (widget: IWidget<string, any>) => {
  const { name: configName } = useConfigContext();
  const updateConfig = useConfigStore((x) => x.updateConfig);

  const definition = Widgets[widget.id as keyof typeof Widgets];

  useEffect(() => {
    if (configName) {
      let hasChanged = false;
      const newProps = { ...widget.properties };

      Object.entries(definition.options).forEach(([key, option]) => {
        if (newProps[key] == null) {
          hasChanged = true;
          newProps[key] = option.defaultValue;
        }
      });

      if (hasChanged) {
        updateConfig(
          configName,
          (prev) => {
            const currentWidget = prev.widgets.find((x) => x.id === widget.id);
            currentWidget!.properties = newProps;

            return {
              ...prev,
              widgets: [...prev.widgets.filter((x) => x.id !== widget.id), currentWidget!],
            };
          },
          true
        );
      }
    }
  }, []);
};

export const WidgetWrapper = ({ widgetId, widget, className, children }: WidgetWrapperProps) => {
  useSetDefaultProps(widget);

  return (
    <HomarrCardWrapper className={className}>
      <WidgetsMenu integration={widgetId} widget={widget} />
      {children}
    </HomarrCardWrapper>
  );
};
