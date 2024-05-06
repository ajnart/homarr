import { useMemo } from 'react';
import * as tldts from 'tldts';
import { AppType } from '~/types/app';

export const useExternalUrl = (app: AppType) => {
  const parsedUrl = useMemo(() => {
    try {
      return tldts.parse(window.location.toString());
    } catch {
      return null;
    }
  }, [window.location]);

  const href = useMemo(() => {
    if (app.behaviour.externalUrl.length > 0) {
      return app.behaviour.externalUrl
        .replace('[homarr_base]', `${window.location.protocol}//${window.location.hostname}`)
        .replace('[homarr_hostname]', parsedUrl?.hostname ?? '')
        .replace('[homarr_domain]', parsedUrl?.domain ?? '')
        .replace('[homarr_protocol]', window.location.protocol.replace(':', ''));
    }
    return app.url;
  }, [app.behaviour.externalUrl, app.url, parsedUrl]);

  return href;
};
