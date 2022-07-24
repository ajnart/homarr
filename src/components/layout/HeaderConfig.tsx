import React from 'react';
import Head from 'next/head';
import { useConfig } from '../../tools/state';

export function HeaderConfig(props: any) {
  const { config } = useConfig();

  return (
    <Head>
      <title>{config.settings.title || 'Homarr 🦞'}</title>
      <link rel="shortcut icon" href={config.settings.favicon || '/favicon.svg'} />
    </Head>
  );
}
