import { ComponentType } from 'react';
import { HomarrCardWrapper } from '~/components/Dashboard/Tiles/HomarrCardWrapper';
import { WidgetsMenu } from '~/components/Dashboard/Tiles/Widgets/WidgetsMenu';

import Widgets from '.';
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
};

export const WidgetWrapper = ({
  widgetType,
  widget,
  className,
  WidgetComponent,
}: WidgetWrapperProps) => {
  const widgetWithDefaultProps = useWidget(widget);

  return (
    <ErrorBoundary integration={widgetType} widget={widgetWithDefaultProps}>
      <HomarrCardWrapper className={className}>
        <WidgetsMenu integration={widgetType} widget={widgetWithDefaultProps} />
        <WidgetComponent widget={widgetWithDefaultProps} />
      </HomarrCardWrapper>
    </ErrorBoundary>
  );
};
