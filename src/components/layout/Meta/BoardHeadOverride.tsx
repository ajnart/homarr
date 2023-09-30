import Head from 'next/head';
import { useRequiredBoard } from '~/components/Board/context';
import { firstUpperCase } from '~/tools/shared/strings';

export const BoardHeadOverride = () => {
  const board = useRequiredBoard();
  const { metaTitle, faviconImageUrl } = board;

  const fallbackTitle = `${firstUpperCase(board.name)} Board • Homarr`;
  const title = metaTitle && metaTitle.length > 0 ? metaTitle : fallbackTitle;

  return (
    <Head>
      <title>{title}</title>
      <meta name="apple-mobile-web-app-title" content={title} />

      {faviconImageUrl && faviconImageUrl.length > 0 && (
        <>
          <link rel="shortcut icon" href={faviconImageUrl} />

          <link rel="apple-touch-icon" href={faviconImageUrl} />
        </>
      )}
    </Head>
  );
};
