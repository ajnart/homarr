import { useRouter } from 'next/router';
import { createContext, useContext } from 'react';
import { RouterOutputs, api } from '~/utils/api';

type BoardContextType = {
  layout?: string;
  board: RouterOutputs['boards']['byName'];
};
const BoardContext = createContext<BoardContextType | null>(null);
type BoardProviderProps = {
  initialBoard: RouterOutputs['boards']['byName'];
  userAgent: string;
  children: React.ReactNode;
};
export const BoardProvider = ({ children, userAgent, ...props }: BoardProviderProps) => {
  const router = useRouter();
  const { layout } = router.query;
  const { data: board } = api.boards.byName.useQuery(
    {
      boardName: props.initialBoard.name,
      layoutId: layout as string | undefined,
      userAgent,
    },
    {
      initialData: props.initialBoard,
      enabled: !!layout,
    }
  );

  return (
    <BoardContext.Provider
      value={{
        ...props,
        board: board!,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};

export const useRequiredBoard = () => {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error('useBoard must be used within a BoardProvider');
  return ctx.board;
};

export const useOptionalBoard = () => {
  const ctx = useContext(BoardContext);
  return ctx?.board ?? null;
};

export type Section = RouterOutputs['boards']['byName']['sections'][number];
type SectionOfType<
  TSection extends Section,
  TSectionType extends Section['kind'],
> = TSection extends { kind: TSectionType } ? TSection : never;
export type CategorySection = SectionOfType<Section, 'category'>;
export type EmptySection = SectionOfType<Section, 'empty'>;
export type SidebarSection = SectionOfType<Section, 'sidebar'>;
export type HiddenSection = SectionOfType<Section, 'hidden'>;

export type Item = Section['items'][number];
type ItemOfType<TItem extends Item, TItemType extends Item['kind']> = TItem extends {
  kind: TItemType;
}
  ? TItem
  : never;
export type AppItem = ItemOfType<Item, 'app'>;
export type WidgetItem = ItemOfType<Item, 'widget'>;
