/* eslint-disable react/no-invalid-html-attribute */
import React from 'react';
import Head from 'next/head';
import { useConfig } from '../../lib/state';

export function HeaderConfig(props: any) {
  const { config } = useConfig();

  return (
    <Head>
      <title>{config.settings.title || 'Homarr 🦞'}</title>
      <link rel="shortcut icon" href={config.settings.favicon || '/favicon.svg'} />

      {/* configure apple splash screen & touch icon */}
      <link rel="apple-touch-icon" href={config.settings.favicon || '/favicon-squared.png'} />
      <link
        rel="apple-touch-startup-image"
        href={config.settings.favicon || '/favicon-squared.png'}
      />
      <meta name="apple-mobile-web-app-title" content={config.settings.title || 'Homarr'} />
    </Head>
  );
}
