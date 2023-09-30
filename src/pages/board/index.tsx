import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { SSRConfig } from 'next-i18next';
import { createContext, useContext } from 'react';
import { Dashboard } from '~/components/Dashboard/Dashboard';
import { BoardLayout } from '~/components/layout/Templates/BoardLayout';
import { env } from '~/env';
import { createTrpcServersideHelpers } from '~/server/api/helper';
import { getServerAuthSession } from '~/server/auth';
import { getDefaultBoardAsync } from '~/server/db/queries/userSettings';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { boardNamespaces } from '~/tools/server/translation-namespaces';
import { RouterOutputs, api } from '~/utils/api';

type BoardContextType = {
  boardName: string;
  layout?: string;
  board: RouterOutputs['boards']['byName'];
};
const BoardContext = createContext<BoardContextType>(null!);
type BoardProviderProps = {
  boardName: string;
  layout?: string;
  children: React.ReactNode;
};
const BoardProvider = ({ children, ...props }: BoardProviderProps) => {
  const { data: board } = api.boards.byName.useQuery(props);

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

const useBoard = () => {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error('useBoard must be used within a BoardProvider');
  return ctx.board;
};

const Data = () => {
  const board = useBoard();

  return <pre>{JSON.stringify(board, null, 2)}</pre>;
};

export default function BoardPage({
  boardName,
  dockerEnabled,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <BoardProvider boardName={boardName}>
      <BoardLayout dockerEnabled={dockerEnabled}>
        <Data />
        <Dashboard />
      </BoardLayout>
    </BoardProvider>
  );
}

type BoardGetServerSideProps = {
  boardName: string;
  dockerEnabled: boolean;
  _nextI18Next?: SSRConfig['_nextI18Next'];
};

export const getServerSideProps: GetServerSideProps<BoardGetServerSideProps> = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  const boardName = await getDefaultBoardAsync(session?.user?.id, 'default');

  const translations = await getServerSideTranslations(
    boardNamespaces,
    ctx.locale,
    ctx.req,
    ctx.res
  );

  const helpers = await createTrpcServersideHelpers(ctx);
  await helpers.boards.byName.prefetch({ boardName });
  const board = await helpers.boards.byNameSimple.fetch({ boardName });

  if (!board.allowGuests && !session?.user) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      boardName,
      primaryColor: board.primaryColor,
      secondaryColor: board.secondaryColor,
      primaryShade: board.primaryShade,
      dockerEnabled: !!env.DOCKER_HOST && !!env.DOCKER_PORT,
      ...translations,
    },
  };
};
