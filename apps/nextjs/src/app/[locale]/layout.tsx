import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "@homarr/notifications/styles.css";
import "@homarr/spotlight/styles.css";
import "@homarr/ui/styles.css";
import "~/styles/scroll-area.scss";

import { notFound } from "next/navigation";
import type { DayOfWeek } from "@mantine/dates";
import { NextIntlClientProvider } from "next-intl";

import { api } from "@homarr/api/server";
import { env } from "@homarr/auth/env";
import { auth } from "@homarr/auth/next";
import { db } from "@homarr/db";
import { getServerSettingsAsync } from "@homarr/db/queries";
import { ModalProvider } from "@homarr/modals";
import { Notifications } from "@homarr/notifications";
import { SettingsProvider } from "@homarr/settings";
import { SpotlightProvider } from "@homarr/spotlight";
import type { SupportedLanguage } from "@homarr/translation";
import { isLocaleRTL, isLocaleSupported } from "@homarr/translation";

import { Analytics } from "~/components/layout/analytics";
import { CrowdinLiveTranslation } from "~/components/layout/crowdin-live-translation";
import { SearchEngineOptimization } from "~/components/layout/search-engine-optimization";
import { getCurrentColorSchemeAsync } from "~/theme/color-scheme";
import { DayJsLoader } from "./_client-providers/dayjs-loader";
import { JotaiProvider } from "./_client-providers/jotai";
import { CustomMantineProvider } from "./_client-providers/mantine";
import { AuthProvider } from "./_client-providers/session";
import { TRPCReactProvider } from "./_client-providers/trpc";
import { composeWrappers } from "./compose";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

// eslint-disable-next-line no-restricted-syntax
export const generateMetadata = async (): Promise<Metadata> => ({
  title: "Homarr",
  description:
    "Simplify the management of your server with Homarr - a sleek, modern dashboard that puts all of your apps and services at your fingertips.",
  openGraph: {
    title: "Homarr Dashboard",
    description:
      "Simplify the management of your server with Homarr - a sleek, modern dashboard that puts all of your apps and services at your fingertips.",
    url: "https://homarr.dev",
    siteName: "Homarr Documentation",
  },
  icons: {
    icon: "/logo/logo.png",
    apple: "/logo/logo.png",
  },
  appleWebApp: {
    title: "Homarr",
    capable: true,
    startupImage: { url: "/logo/logo.png" },
    statusBarStyle: (await getCurrentColorSchemeAsync()) === "dark" ? "black-translucent" : "default",
  },
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: SupportedLanguage }>;
}) {
  if (!isLocaleSupported((await props.params).locale)) {
    notFound();
  }

  const session = await auth();
  const user = session ? await api.user.getById({ userId: session.user.id }).catch(() => null) : null;
  const serverSettings = await getServerSettingsAsync(db);
  const colorScheme = await getCurrentColorSchemeAsync();
  const direction = isLocaleRTL((await props.params).locale) ? "rtl" : "ltr";

  const StackedProvider = composeWrappers([
    (innerProps) => {
      return <AuthProvider session={session} logoutUrl={env.AUTH_LOGOUT_REDIRECT_URL} {...innerProps} />;
    },
    (innerProps) => (
      <SettingsProvider
        user={
          user
            ? {
                ...user,
                // Convert type, because output schema is not smart enough to infer $type from drizzle
                firstDayOfWeek: user.firstDayOfWeek as DayOfWeek,
              }
            : null
        }
        serverSettings={{
          board: {
            homeBoardId: serverSettings.board.homeBoardId,
            mobileHomeBoardId: serverSettings.board.mobileHomeBoardId,
            enableStatusByDefault: serverSettings.board.enableStatusByDefault,
            forceDisableStatus: serverSettings.board.forceDisableStatus,
          },
          search: { defaultSearchEngineId: serverSettings.search.defaultSearchEngineId },
          user: { enableGravatar: serverSettings.user.enableGravatar },
        }}
        {...innerProps}
      />
    ),
    (innerProps) => <JotaiProvider {...innerProps} />,
    (innerProps) => <TRPCReactProvider {...innerProps} />,
    (innerProps) => <DayJsLoader {...innerProps} />,
    (innerProps) => <NextIntlClientProvider {...innerProps} />,
    (innerProps) => <CustomMantineProvider {...innerProps} defaultColorScheme={colorScheme} />,
    (innerProps) => <ModalProvider {...innerProps} />,
    (innerProps) => <SpotlightProvider {...innerProps} />,
  ]);

  const { locale } = await props.params;

  return (
    // Instead of ColorSchemScript we use data-mantine-color-scheme to prevent flickering
    <html
      lang={locale}
      dir={direction}
      data-mantine-color-scheme={colorScheme}
      style={{
        backgroundColor: colorScheme === "dark" ? "#242424" : "#fff",
      }}
      suppressHydrationWarning
    >
      <head>
        <Analytics />
        <SearchEngineOptimization />
        <CrowdinLiveTranslation locale={locale} />
      </head>
      <body className={["font-sans", fontSans.variable].join(" ")}>
        <StackedProvider>
          <Notifications />
          {props.children}
        </StackedProvider>
      </body>
    </html>
  );
}
