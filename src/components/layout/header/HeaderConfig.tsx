/* eslint-disable react/no-invalid-html-attribute */
import React from 'react';
import Head from 'next/head';
import { useConfig } from '../../../tools/state';
import { SafariStatusBarStyle } from './safariStatusBarStyle';

export function HeaderConfig(props: any) {
  const { config } = useConfig();

  return (
    <Head>
      <title>{config.settings.title || 'Homarr 🦞'}</title>
      <link rel="shortcut icon" href={config.settings.favicon || '/imgs/favicon/favicon.svg'} />

      <link rel="manifest" href="/site.webmanifest" />

      {/* configure apple splash screen & touch icon */}
      <link
        rel="apple-touch-icon"
        href={config.settings.favicon || '/imgs/favicon/favicon-squared.png'}
      />
      <meta name="apple-mobile-web-app-title" content={config.settings.title || 'Homarr'} />

      <SafariStatusBarStyle />
      <meta name="apple-mobile-web-app-capable" content="yes" />
    </Head>
  );
}
