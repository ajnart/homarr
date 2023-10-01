import { Button } from '@mantine/core';
import { GridItemHTMLElement } from 'fily-publish-gridstack';
import { EmptySection, useRequiredBoard } from '~/components/Board/context';
import { GridstackProvider } from '~/components/Board/gridstack/context';
import { useItemActions } from '~/components/Board/item-actions';

import { useEditModeStore } from '../../Views/useEditModeStore';
import { WrapperContent } from '../WrapperContent';
import { useGridstack } from '../gridstack/use-gridstack';

interface DashboardWrapperProps {
  section: EmptySection;
}

export const DashboardWrapper = ({ section }: DashboardWrapperProps) => {
  const { refs } = useGridstack({ section });
  const isEditMode = useEditModeStore((x) => x.enabled);
  const defaultClasses = 'grid-stack grid-stack-empty min-row';

  return (
    <GridstackProvider gridstackRef={refs.gridstack}>
      <div
        className={
          section.items.length > 0 || isEditMode
            ? defaultClasses
            : `${defaultClasses} gridstack-empty-wrapper`
        }
        style={{ transitionDuration: '0s' }}
        data-empty={section.id}
        ref={refs.wrapper}
      >
        <WrapperContent items={section.items} refs={refs} />
      </div>
    </GridstackProvider>
  );
};
