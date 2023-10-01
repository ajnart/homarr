import { GridItemHTMLElement, GridStack } from 'fily-publish-gridstack';
import { PropsWithChildren, createContext, createRef, useContext } from 'react';

type GridItemContextProps = {
  ref: React.RefObject<GridItemHTMLElement> | null;
};

const GridItemContext = createContext<GridItemContextProps>({
  ref: null,
});

export const useGridItemRef = () => {
  const ctx = useContext(GridItemContext);
  if (!ctx || !ctx.ref)
    throw new Error('useGridstackContext must be used within a GridItemProvider');
  return ctx.ref;
};

type GridItemProviderProps = PropsWithChildren<{
  itemRef: React.RefObject<GridItemHTMLElement>;
}>;

export const GridItemProvider = ({ children, itemRef }: GridItemProviderProps) => {
  return <GridItemContext.Provider value={{ ref: itemRef }}>{children}</GridItemContext.Provider>;
};
