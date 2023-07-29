/* eslint-disable react/no-invalid-html-attribute */
import NextHead from 'next/head';
import React from 'react';

import { useConfigContext } from '../../../config/provider';
import { SafariStatusBarStyle } from './SafariStatusBarStyle';

export function Head() {
  const { config } = useConfigContext();

  return (
    <NextHead>
      <title>{config?.settings.customization.metaTitle || 'Homarr 🦞'}</title>
      <link
        rel="shortcut icon"
        href={config?.settings.customization.faviconUrl || '/imgs/favicon/favicon.svg'}
      />

      <link rel="manifest" href="/site.webmanifest" />

      {/* configure apple splash screen & touch icon */}
      <link
        rel="apple-touch-icon"
        href={config?.settings.customization.faviconUrl || '/imgs/favicon/favicon.svg'}
      />
      <meta
        name="apple-mobile-web-app-title"
        content={config?.settings.customization.metaTitle || 'Homarr'}
      />

      <SafariStatusBarStyle />
      <meta name="apple-mobile-web-app-capable" content="yes" />
    </NextHead>
  );
}
