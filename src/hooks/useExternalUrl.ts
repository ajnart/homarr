import { useCallback, useMemo } from 'react';
import * as tldts from 'tldts';
import { AppType } from '~/types/app';

export const useGetExternalUrl = () => {
  if (typeof window === 'undefined') {
    return (appType: AppType) => appType.behaviour.externalUrl || appType.url;
  }

  const parsedUrl = useMemo(() => {
    try {
      return tldts.parse(window.location.toString());
    } catch {
      return null;
    }
  }, [window.location]);

  const getHref = useCallback(
    (appType: AppType) => {
      if (appType.behaviour.externalUrl.length > 0) {
        return appType.behaviour.externalUrl
          .replace('[homarr_base]', `${window.location.protocol}//${window.location.hostname}`)
          .replace('[homarr_hostname]', parsedUrl?.hostname ?? '')
          .replace('[homarr_domain]', parsedUrl?.domain ?? '')
          .replace('[homarr_protocol]', window.location.protocol.replace(':', ''));
      }
      return appType.url;
    },
    [parsedUrl]
  );

  return getHref;
};

export const useExternalUrl = (app: AppType) => {
  const getHref = useGetExternalUrl();

  const href = useMemo(() => {
    return getHref(app);
  }, [app, getHref]);

  return href;
};
