import { getCookie } from 'cookies-next';
import { IncomingMessage, ServerResponse } from 'http';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getServerSideTranslations = async (
  namespaces: string[],
  requestLocale?: string,
  req?: IncomingMessage,
  res?: ServerResponse,
) => {
  if (!req || !res) {
    return await serverSideTranslations(
      requestLocale ?? 'en',
      namespaces
    );
  }

  const configLocale = getCookie('config-locale', { req, res });

  return await serverSideTranslations(
    (configLocale ?? requestLocale ?? 'en') as string,
    namespaces
  );
};
