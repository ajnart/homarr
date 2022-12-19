import { WrapperType } from '../../../../types/wrapper';
import { useGridstack } from '../gridstack/use-gridstack';
import { WrapperContent } from '../WrapperContent';

interface DashboardWrapperProps {
  wrapper: WrapperType;
}

export const DashboardWrapper = ({ wrapper }: DashboardWrapperProps) => {
  const { refs, apps, widgets } = useGridstack('wrapper', wrapper.id);

  return (
    <div
      className="grid-stack grid-stack-wrapper"
      style={{ transitionDuration: '0s' }}
      data-wrapper={wrapper.id}
      ref={refs.wrapper}
    >
      <WrapperContent apps={apps} refs={refs} widgets={widgets} />
    </div>
  );
};
