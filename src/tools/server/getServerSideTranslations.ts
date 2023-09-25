import { getCookie } from 'cookies-next';
import { IncomingMessage, ServerResponse } from 'http';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { COOKIE_LOCALE_KEY } from '../../../data/constants';
import nextI18nextConfig from '../../../next-i18next.config.js';

export const getServerSideTranslations = async (
  namespaces: string[],
  requestLocale?: string,
  req?: IncomingMessage,
  res?: ServerResponse
) => {
  return undefined;
  namespaces = namespaces.concat(['common', 'zod', 'layout/header', 'layout/modals/about']);

  if (!req || !res) {
    return serverSideTranslations(requestLocale ?? 'en', namespaces);
  }

  const configLocale = getCookie(COOKIE_LOCALE_KEY, { req, res });

  return serverSideTranslations(
    (configLocale ?? requestLocale ?? 'en') as string,
    namespaces,
    nextI18nextConfig as any
  );
};
