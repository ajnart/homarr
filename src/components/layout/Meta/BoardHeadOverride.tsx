import Head from 'next/head';
import React from 'react';
import { useConfigContext } from '~/config/provider';
import { firstUpperCase } from '~/tools/shared/strings';

export const BoardHeadOverride = () => {
  const { config, name } = useConfigContext();

  if (!config || !name) return null;

  const { metaTitle, faviconUrl } = config.settings.customization;
  const fallbackTitle = `${firstUpperCase(name)} Board • Homarr`;
  const title = metaTitle && metaTitle.length > 0 ? metaTitle : fallbackTitle;

  return (
    <Head>
      <title>{title}</title>
      <meta name="apple-mobile-web-app-title" content={title} />

      {faviconUrl && faviconUrl.length > 0 && (
        <>
          <link rel="shortcut icon" href={faviconUrl} />

          <link rel="apple-touch-icon" href={pwaIcon} />
        </>
      )}
    </Head>
  );
};
