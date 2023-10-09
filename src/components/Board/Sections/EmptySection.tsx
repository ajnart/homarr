import { EmptySection } from '~/components/Board/context';
import { GridstackProvider } from '~/components/Board/gridstack/context';

import { useGridstack } from '../gridstack/use-gridstack';
import { useEditModeStore } from '../useEditModeStore';
import { SectionContent } from './SectionContent';

interface EmptySectionWrapperProps {
  section: EmptySection;
}

const defaultClasses = 'grid-stack grid-stack-empty min-row';

export const BoardEmptySection = ({ section }: EmptySectionWrapperProps) => {
  const { refs } = useGridstack({ section });
  const isEditMode = useEditModeStore((x) => x.enabled);

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
        {section.items.length === 0 && <span></span>}
        <SectionContent items={section.items} refs={refs} />
      </div>
    </GridstackProvider>
  );
};
