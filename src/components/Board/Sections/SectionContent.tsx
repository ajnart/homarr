import { GridItemHTMLElement } from 'fily-publish-gridstack';
import { MutableRefObject, RefObject, useMemo } from 'react';
import { AppItem, Item, WidgetItem } from '~/components/Board/context';
import { WidgetWrapper } from '~/widgets/WidgetWrapper';

import Widgets from '../../../widgets';
import { BoardAppItem } from '../Items/App/AppItem';
import { GridstackItemWrapper } from '../Items/GridstackItemWrapper';

interface SectionContentProps {
  items: Item[];
  refs: {
    wrapper: RefObject<HTMLDivElement>;
    items: MutableRefObject<Record<string, RefObject<GridItemHTMLElement>>>;
  };
}

export function SectionContent({ items, refs }: SectionContentProps) {
  const apps = useMemo(() => items.filter((x): x is AppItem => x.kind === 'app'), [items]);
  const widgets = useMemo(() => items.filter((x): x is WidgetItem => x.kind === 'widget'), [items]);

  return (
    <>
      {apps?.map((app) => (
        <GridstackItemWrapper
          id={app.id}
          kind="app"
          key={app.id}
          itemRef={refs.items.current[app.id]}
          maxHeight={12}
          maxWidth={12}
          minHeight={1}
          minWidth={1}
          x={app.x}
          y={app.y}
          width={app.width}
          height={app.height}
        >
          <BoardAppItem className="grid-stack-item-content" app={app} />
        </GridstackItemWrapper>
      ))}
      {widgets.map((widget) => {
        const definition = Widgets[widget.type];
        if (!definition) return null;

        return (
          <GridstackItemWrapper
            kind="widget"
            key={widget.id}
            itemRef={refs.items.current[widget.id]}
            id={widget.id}
            {...definition.gridstack}
            x={widget.x}
            y={widget.y}
            width={widget.width}
            height={widget.height}
          >
            <WidgetWrapper
              className="grid-stack-item-content"
              widget={widget}
              WidgetComponent={definition.component as any}
            />
          </GridstackItemWrapper>
        );
      })}
    </>
  );
}
