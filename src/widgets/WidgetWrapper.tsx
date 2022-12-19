import { ReactNode } from 'react';
import { HomarrCardWrapper } from '../components/Dashboard/Tiles/HomarrCardWrapper';
import { WidgetsMenu } from '../components/Dashboard/Tiles/Widgets/WidgetsMenu';
import { IWidget } from './widgets';

interface WidgetWrapperProps {
  widgetId: string;
  widget: IWidget<string, any>;
  className: string;
  children: ReactNode;
}

export const WidgetWrapper = ({ widgetId, widget, className, children }: WidgetWrapperProps) => {
  return (
    <HomarrCardWrapper className={className}>
      <WidgetsMenu integration={widgetId} widget={widget} />
      {children}
    </HomarrCardWrapper>
  );
};
