import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

import type { SupportedLanguage } from "../config";
import { useCurrentLocale } from "./use-current-locale";

export const useChangeLocale = () => {
  const currentLocale = useCurrentLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return {
    changeLocale: (newLocale: SupportedLanguage) => {
      if (newLocale === currentLocale) {
        return;
      }

      startTransition(() => {
        router.replace(`/${newLocale}/${pathname}`);
      });
    },
    isPending,
  };
};
