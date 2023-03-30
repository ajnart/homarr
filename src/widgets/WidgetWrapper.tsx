import { ComponentType, useMemo } from 'react';
import Widgets from '.';
import { HomarrCardWrapper } from '../components/Dashboard/Tiles/HomarrCardWrapper';
import { WidgetsMenu } from '../components/Dashboard/Tiles/Widgets/WidgetsMenu';
import ErrorBoundary from './boundary';
import { IWidget } from './widgets';

interface WidgetWrapperProps {
  widgetType: string;
  widget: IWidget<string, any>;
  className: string;
  WidgetComponent: ComponentType<{ widget: IWidget<string, any> }>;
}

// If a property has no value, set it to the default value
const useWidget = <T extends IWidget<string, any>>(widget: T): T => {
  const definition = Widgets[widget.type as keyof typeof Widgets];

  return useMemo(() => {
    const newProps = { ...widget.properties };

    Object.entries(definition.options).forEach(([key, option]) => {
      if (newProps[key] == null) {
        newProps[key] = option.defaultValue;
      }
    });

    return {
      ...widget,
      properties: newProps,
    };
  }, [widget]);
};

export const WidgetWrapper = ({
  widgetType: widgetId,
  widget,
  className,
  WidgetComponent,
}: WidgetWrapperProps) => {
  const widgetWithDefaultProps = useWidget(widget);

  return (
    <ErrorBoundary>
      <HomarrCardWrapper className={className}>
        <WidgetsMenu integration={widgetId} widget={widgetWithDefaultProps} />
        <WidgetComponent widget={widgetWithDefaultProps} />
      </HomarrCardWrapper>
    </ErrorBoundary>
  );
};
