import { getCookie } from 'cookies-next';
import { IncomingMessage, ServerResponse } from 'http';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getServerSideTranslations = async (
  req: IncomingMessage,
  res: ServerResponse,
  namespaces: string[],
  requestLocale?: string
) => {
  const configLocale = getCookie('config-locale', { req, res });

  const translations = await serverSideTranslations(
    (configLocale ?? requestLocale ?? 'en') as string,
    namespaces
  );

  return translations;
};
