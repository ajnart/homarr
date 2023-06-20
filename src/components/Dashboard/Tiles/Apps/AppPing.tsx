import { Indicator, Tooltip } from '@mantine/core';
import Consola from 'consola';
import { useTranslation } from 'next-i18next';
import { api } from '~/utils/api';

import { useConfigContext } from '../../../../config/provider';
import { AppType } from '../../../../types/app';

interface AppPingProps {
  app: AppType;
}

export const AppPing = ({ app }: AppPingProps) => {
  const { t } = useTranslation('modules/ping');
  const { config } = useConfigContext();
  const active =
    (config?.settings.customization.layout.enabledPing && app.network.enabledStatusChecker) ??
    false;
  const { data, isLoading, isFetching, isSuccess } = api.app.ping.useQuery(app.id, {
    retry: false,
    enabled: active,
    select: (data) => {
      const isOk = getIsOk(app, data.status);
      Consola.info(`Ping ${app.name} (${app.url}) ${data.status} ${isOk}`);
      return {
        status: data.status,
        state: isOk ? ('online' as const) : ('down' as const),
        statusText: data.statusText,
      };
    },
  });

  if (!active) return null;

  return (
    <div style={{ position: 'absolute', bottom: 15, right: 15, zIndex: 2 }}>
      <Tooltip
        withinPortal
        radius="lg"
        label={
          isLoading
            ? t('states.loading')
            : data?.state === 'online'
            ? t('states.online', { response: data?.status ?? 'N/A' })
            : `${data?.statusText} ${data?.status}`
        }
      >
        <Indicator
          size={15}
          processing={isSuccess}
          color={isFetching ? 'yellow' : data?.state === 'online' ? 'green' : 'red'}
          children={null}
        />
      </Tooltip>
    </div>
  );
};

export const getIsOk = (app: AppType, status: number) => {
  if (app.network.okStatus === undefined || app.network.statusCodes.length >= 1) {
    Consola.log('Using new status codes');
    return app.network.statusCodes.includes(status.toString());
  }
  Consola.warn('Using deprecated okStatus');
  return app.network.okStatus.includes(status);
};
