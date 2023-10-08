import { EmptySection } from '~/components/Board/context';
import { GridstackProvider } from '~/components/Board/gridstack/context';

import { useEditModeStore } from '../../Dashboard/Views/useEditModeStore';
import { WrapperContent } from '../../Dashboard/Wrappers/WrapperContent';
import { useGridstack } from '../../Dashboard/Wrappers/gridstack/use-gridstack';

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
        <WrapperContent items={section.items} refs={refs} />
      </div>
    </GridstackProvider>
  );
};
