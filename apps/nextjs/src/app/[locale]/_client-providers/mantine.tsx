"use client";

import type { PropsWithChildren } from "react";
import type { MantineColorScheme, MantineColorSchemeManager } from "@mantine/core";
import { createTheme, DirectionProvider, MantineProvider } from "@mantine/core";
import dayjs from "dayjs";

import { clientApi } from "@homarr/api/client";
import { useSession } from "@homarr/auth/client";
import { parseCookies, setClientCookie } from "@homarr/common";
import type { ColorScheme } from "@homarr/definitions";
import { colorSchemeCookieKey } from "@homarr/definitions";

export const CustomMantineProvider = ({
  children,
  defaultColorScheme,
}: PropsWithChildren<{ defaultColorScheme: ColorScheme }>) => {
  const manager = useColorSchemeManager();
  return (
    <DirectionProvider>
      <MantineProvider
        defaultColorScheme={defaultColorScheme}
        colorSchemeManager={manager}
        theme={createTheme({
          primaryColor: "red",
          autoContrast: true,
        })}
      >
        {children}
      </MantineProvider>
    </DirectionProvider>
  );
};

export function useColorSchemeManager(): MantineColorSchemeManager {
  const { data: session } = useSession();

  const updateCookieValue = (value: Exclude<MantineColorScheme, "auto">) => {
    setClientCookie(colorSchemeCookieKey, value, { expires: dayjs().add(1, "year").toDate(), path: "/" });
  };

  const { mutate: mutateColorScheme } = clientApi.user.changeColorScheme.useMutation({
    onSuccess: (_, variables) => {
      updateCookieValue(variables.colorScheme);
    },
  });

  return {
    get: (defaultValue) => {
      if (typeof window === "undefined") {
        return defaultValue;
      }

      try {
        const cookies = parseCookies(document.cookie);
        return (cookies[colorSchemeCookieKey] as MantineColorScheme | undefined) ?? defaultValue;
      } catch {
        return defaultValue;
      }
    },

    set: (value) => {
      if (value === "auto") return;
      try {
        if (session) {
          mutateColorScheme({ colorScheme: value });
        }
        updateCookieValue(value);
      } catch (error) {
        console.warn("[@mantine/core] Color scheme manager was unable to save color scheme.", error);
      }
    },
    subscribe: () => undefined,
    unsubscribe: () => undefined,
    clear: () => undefined,
  };
}
