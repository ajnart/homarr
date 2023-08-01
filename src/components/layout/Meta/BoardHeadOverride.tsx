import Head from 'next/head';
import React from 'react';

import { useConfigContext } from '../../../config/provider';

export const BoardHeadOverride = () => {
  const { config } = useConfigContext();

  if (!config) return null;

  const { metaTitle, faviconUrl } = config.settings.customization;

  return (
    <Head>
      {metaTitle && metaTitle.length > 0 && (
        <>
          <title>{metaTitle}</title>
          <meta name="apple-mobile-web-app-title" content={metaTitle} />
        </>
      )}

      {faviconUrl && faviconUrl.length > 0 && (
        <>
          <link rel="shortcut icon" href={faviconUrl} />

          <link rel="apple-touch-icon" href={faviconUrl} />
        </>
      )}
    </Head>
  );
};
