import { useEventListener } from '@mantine/hooks';
import Router, { useRouter } from 'next/router';
import { createContext, useContext, useEffect } from 'react';
import { RouterOutputs, api } from '~/utils/api';

import { useEditModeStore } from './useEditModeStore';

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
  const { enabled } = useEditModeStore();
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
      //enabled: !!layout,
    }
  );

  useConfirmLeavePage(enabled);

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
