import { ComponentType } from 'react';
import { ItemWrapper } from '~/components/Board/Items/ItemWrapper';
import { WidgetsMenu } from '~/components/Board/Items/Widget/WidgetsMenu';
import { WidgetItem } from '~/components/Board/context';

import Widgets from '.';
import ErrorBoundary from './boundary';

interface WidgetWrapperProps {
  widget: WidgetItem;
  className: string;
  WidgetComponent: ComponentType<{ widget: WidgetItem }>;
}

// If a property has no value, set it to the default value
const useWidgetWithDefaultOptionValues = <T extends WidgetItem>(widget: T): T => {
  const definition = Widgets[widget.type];

  const newProps: Record<string, unknown> = {};

  Object.entries(definition.options).forEach(([key, option]) => {
    if (newProps[key] == null) {
      newProps[key] = widget.options[key] ?? option.defaultValue;
    }
  });

  return {
    ...widget,
    options: newProps,
  };
};

export const WidgetWrapper = ({ widget, className, WidgetComponent }: WidgetWrapperProps) => {
  const widgetWithDefaultProps = useWidgetWithDefaultOptionValues(widget);

  return (
    <ErrorBoundary widget={widgetWithDefaultProps}>
      <ItemWrapper className={className}>
        <WidgetsMenu widget={widgetWithDefaultProps} />
        <WidgetComponent widget={widgetWithDefaultProps} />
      </ItemWrapper>
    </ErrorBoundary>
  );
};
