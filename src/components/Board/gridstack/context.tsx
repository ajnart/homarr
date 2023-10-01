import { GridStack } from 'fily-publish-gridstack';
import { PropsWithChildren, createContext, createRef, useContext } from 'react';

type GridstackContextProps = {
  ref: React.MutableRefObject<GridStack | undefined> | null;
};

const GridstackContext = createContext<GridstackContextProps>({
  ref: null,
});

export const useGridstackRef = () => {
  const ctx = useContext(GridstackContext);
  if (!ctx || !ctx.ref)
    throw new Error('useGridstackContext must be used within a GridstackProvider');
  return ctx.ref;
};

type GridstackProviderProps = PropsWithChildren<{
  gridstackRef: React.MutableRefObject<GridStack | undefined>;
}>;

export const GridstackProvider = ({ children, gridstackRef }: GridstackProviderProps) => {
  return (
    <GridstackContext.Provider value={{ ref: gridstackRef }}>{children}</GridstackContext.Provider>
  );
};
