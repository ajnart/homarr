import Head from 'next/head';
import { ReactNode } from 'react';

interface CommonHeaderProps {
  children?: ReactNode;
}

export const CommonHeader = ({ children }: CommonHeaderProps) => {
  return (
    <Head>
      <link rel="shortcut icon" href="/imgs/favicon/favicon.svg" />

      <link rel="manifest" href="/site.webmanifest" />

      {/* configure apple splash screen & touch icon */}
      <link rel="apple-touch-icon" href="/imgs/favicon/favicon.svg" />
      <meta name="apple-mobile-web-app-title" content="Homarr" />

      <meta name="apple-mobile-web-app-capable" content="yes" />

      {children}
    </Head>
  );
};
