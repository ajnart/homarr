import { useEventListener } from '@mantine/hooks';
import Router, { useRouter } from 'next/router';
import { createContext, useContext, useEffect } from 'react';
import { RouterOutputs, api } from '~/utils/api';

import { useRequiredBoardProps } from './outer-context';
import { useEditModeStore } from './useEditModeStore';

type BoardContextType = {
  board: RouterOutputs['boards']['byName'];
};
const BoardContext = createContext<BoardContextType | null>(null);
type BoardProviderProps = {
  initialBoard: RouterOutputs['boards']['byName'];
  userAgent: string;
  children: React.ReactNode;
};
export const BoardProvider = ({ children, userAgent, ...props }: BoardProviderProps) => {
  const { setProps } = useRequiredBoardProps();
  const { enabled } = useEditModeStore();
  const router = useRouter();
  const { layout } = router.query;
  const { data: queryBoard } = api.boards.byName.useQuery(
    {
      boardName: props.initialBoard.name,
      layoutId: layout as string | undefined,
      userAgent,
    },
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      enabled: typeof window !== 'undefined', // Disable on server-side so it is not cached with an old result.
    }
  );

  // Setting props for the outer context so they can be used within modals.
  useEffect(() => {
    if (!queryBoard) return;
    setProps({
      boardName: queryBoard.name,
      boardId: queryBoard.id,
      layoutId: layout as string | undefined,
    });
  }, [layout, queryBoard?.name, queryBoard?.id, setProps]);

  const board = queryBoard ?? props.initialBoard; // Initialdata property is not working because it somehow ignores the enabled property.

  useConfirmLeavePage(enabled);

  return (
    <BoardContext.Provider
      value={{
        board: board!,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};

export const useRequiredBoard = () => {
  const optionalBoard = useOptionalBoard();
  if (!optionalBoard) throw new Error('useBoard must be used within a BoardProvider');
  return optionalBoard;
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

const useConfirmLeavePage = (enabled: boolean) => {
  const utils = api.useUtils();
  const { toggleEditMode } = useEditModeStore();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (enabled && Router.pathname !== url) {
        Router.events.emit('routeChangeError');
        const shouldLeave = window.confirm(
          'You have unsaved changes. Are you sure you want to leave?'
        );
        if (!shouldLeave) {
          throw 'abort-navigation';
        }

        toggleEditMode();
        utils.boards.byName.invalidate();
      }
    };

    const catchAbortNavigationError = (event: PromiseRejectionEvent) => {
      if (event.reason === 'abort-navigation') {
        event.preventDefault();
      }
    };

    Router.beforePopState(({ url }) => {
      if (enabled) {
        if (Router.pathname !== url) {
          window.history.pushState('', '', url);
          return false;
        }
      }
      return true;
    });

    // For changing in-app route.
    if (enabled) {
      Router.events.on('routeChangeStart', handleRouteChange);
      window.addEventListener('unhandledrejection', catchAbortNavigationError);
      window.onbeforeunload = () => '';
      window.close = () => '';
    }
    return () => {
      Router.beforePopState(() => true);
      Router.events.off('routeChangeStart', handleRouteChange);
      window.removeEventListener('unhandledrejection', catchAbortNavigationError);
      window.onbeforeunload = null;
      window.close = () => null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
  useEventListener('close', () => {
    if (enabled) return '';
  });
};
