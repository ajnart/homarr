import { ColorSchemeScript } from '@mantine/core';
import { Head, Html, Main, NextScript } from 'next/document';

import { augmentDocumentWithEmotionCache } from './_app';

function Document() {
  return (
    <Html lang="en">
      <Head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

augmentDocumentWithEmotionCache(Document);
export default Document;
