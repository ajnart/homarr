import { TRPCError } from '@trpc/server';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { SSRConfig } from 'next-i18next';
import { Board } from '~/components/Board/Board';
import { BoardProvider } from '~/components/Board/context';
import { BoardLayout } from '~/components/layout/Templates/BoardLayout';
import { env } from '~/env';
import { createTrpcServersideHelpers } from '~/server/api/helper';
import { getServerAuthSession } from '~/server/auth';
import { getDefaultBoardAsync } from '~/server/db/queries/userSettings';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { checkForSessionOrAskForLogin } from '~/tools/server/loginBuilder';
import { boardNamespaces } from '~/tools/server/translation-namespaces';
import { RouterOutputs } from '~/utils/api';

export default function BoardPage({
  board,
  dockerEnabled,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <BoardProvider initialBoard={board}>
      <BoardLayout dockerEnabled={dockerEnabled}>
        <Board />
      </BoardLayout>
    </BoardProvider>
  );
}

type BoardGetServerSideProps = {
  board: RouterOutputs['boards']['byName'];
  dockerEnabled: boolean;
  _nextI18Next?: SSRConfig['_nextI18Next'];
};

export const getServerSideProps: GetServerSideProps<BoardGetServerSideProps> = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  const boardName = await getDefaultBoardAsync(session?.user?.id, 'default');
  const helpers = await createTrpcServersideHelpers(ctx);
  const board = await helpers.boards.byName.fetch({ boardName }).catch((err) => {
    if (err instanceof TRPCError && err.code === 'NOT_FOUND') {
      return null;
    }
    throw err;
  });

  if (!board) {
    return {
      notFound: true,
    };
  }

  const result = checkForSessionOrAskForLogin(
    ctx,
    session,
    () => board.allowGuests || session?.user != undefined
  );
  if (result) {
    return result;
  }

  const translations = await getServerSideTranslations(
    boardNamespaces,
    ctx.locale,
    ctx.req,
    ctx.res
  );

  return {
    props: {
      board,
      primaryColor: board.primaryColor,
      secondaryColor: board.secondaryColor,
      primaryShade: board.primaryShade,
      dockerEnabled: !!env.DOCKER_HOST && !!env.DOCKER_PORT,
      ...translations,
    },
  };
};
