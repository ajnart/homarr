import { ComponentType } from 'react';
import { WidgetItem } from '~/components/Board/context';
import { HomarrCardWrapper } from '~/components/Dashboard/Tiles/HomarrCardWrapper';
import { WidgetsMenu } from '~/components/Dashboard/Tiles/Widgets/WidgetsMenu';

import Widgets from '.';
import ErrorBoundary from './boundary';
import { IWidget } from './widgets';

interface WidgetWrapperProps {
  widgetType: string;
  widget: WidgetItem;
  className: string;
  WidgetComponent: ComponentType<{ widget: WidgetItem }>;
}

// If a property has no value, set it to the default value
const useWidget = <T extends WidgetItem>(widget: T): T => {
  const definition = Widgets[widget.sort];

  const newProps = { ...widget.options };

  Object.entries(definition.options).forEach(([key, option]) => {
    if (newProps[key] == null) {
      newProps[key] = option.defaultValue;
    }
  });

  return {
    ...widget,
    options: newProps,
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
        <WidgetsMenu type={widgetType} widget={widgetWithDefaultProps} />
        <WidgetComponent widget={widgetWithDefaultProps} />
      </HomarrCardWrapper>
    </ErrorBoundary>
  );
};
