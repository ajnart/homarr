import { useCallback, useEffect, useState, MutableRefObject } from 'react';

export const useResize = (myRef: MutableRefObject<HTMLDivElement | null>) => {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const handleResize = useCallback(() => {
    setWidth(myRef.current?.offsetWidth ?? 0);
    setHeight(myRef.current?.offsetHeight ?? 0);
  }, [myRef]);

  useEffect(() => {
    window.addEventListener('load', handleResize);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('load', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, [myRef, handleResize]);

  useEffect(() => {
    handleResize();
  }, [myRef]);

  return { width, height };
};
