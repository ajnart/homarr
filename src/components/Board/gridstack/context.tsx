import { GridStack } from 'fily-publish-gridstack';
import { PropsWithChildren, createContext, useContext } from 'react';

type GridstackContextProps = {
  ref: React.MutableRefObject<GridStack | undefined> | null;
};

const GridstackContext = createContext<GridstackContextProps>({
  ref: null,
});

export const useGridstackRef = () => {
  const ctx = useContext(GridstackContext);
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
