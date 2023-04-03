import { IncomingMessage, ServerResponse } from 'http';
import { getCookie } from 'cookies-next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getServerSideTranslations = async (
  namespaces: string[],
  requestLocale?: string,
  req?: IncomingMessage,
  res?: ServerResponse
) => {
  if (!req || !res) {
    return serverSideTranslations(requestLocale ?? 'en', namespaces);
  }

  const configLocale = getCookie('config-locale', { req, res });

  return serverSideTranslations((configLocale ?? requestLocale ?? 'en') as string, namespaces);
};
