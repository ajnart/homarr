// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { NextAppDirEmotionCacheProvider } from 'tss-react/next/appDir';
// Import all mantine styles
import '~/styles/mantine';

export const metadata = {
  //TODO: Add default metadata here
  // title: 'Homarr',
  // description: 'Homarr',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <NextAppDirEmotionCacheProvider options={{ key: 'css' }}>
          <MantineProvider defaultColorScheme="auto">{children}</MantineProvider>
        </NextAppDirEmotionCacheProvider>
      </body>
    </html>
  );
}
