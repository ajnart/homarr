import { useGridItemRef } from '../item/context';
import { useGridstackRef } from './context';

type ResizeGridItemProps = {
  height: number;
  width: number;
  x: number;
  y: number;
};

export const useResizeGridItem = () => {
  const itemRef = useGridItemRef();
  const gridstackRef = useGridstackRef();

  return ({ height, width, ...options }: ResizeGridItemProps) => {
    gridstackRef.current?.batchUpdate();
    gridstackRef.current?.update(itemRef.current!, {
      ...options,
      h: height,
      w: width,
    });
    gridstackRef.current?.batchUpdate(false);
  };
};
