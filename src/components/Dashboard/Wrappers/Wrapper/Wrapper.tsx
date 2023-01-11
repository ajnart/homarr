import { WrapperType } from '../../../../types/wrapper';
import { useEditModeStore } from '../../Views/useEditModeStore';
import { useGridstack } from '../gridstack/use-gridstack';
import { WrapperContent } from '../WrapperContent';

interface DashboardWrapperProps {
  wrapper: WrapperType;
}

export const DashboardWrapper = ({ wrapper }: DashboardWrapperProps) => {
  const { refs, apps, widgets } = useGridstack('wrapper', wrapper.id);
  const isEditMode = useEditModeStore((x) => x.enabled);
  const defaultClasses = 'grid-stack grid-stack-wrapper min-row';

  return (
    <div
      className={apps.length > 0 || isEditMode ? defaultClasses : `${defaultClasses} gridstack-empty-wrapper`}
      style={{ transitionDuration: '0s' }}
      data-wrapper={wrapper.id}
      ref={refs.wrapper}
    >
      <WrapperContent apps={apps} refs={refs} widgets={widgets} />
    </div>
  );
};
