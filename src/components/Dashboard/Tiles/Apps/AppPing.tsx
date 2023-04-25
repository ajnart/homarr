import { Indicator, Tooltip } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '../../../../config/provider';
import { api } from '../../../../tools/tRPC';
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
  const data = api.ping.useQuery(app.id, {
    queryKey: ['ping', app.name],
    retry: false,
    enabled: active,
  });

  const isOk = data.isSuccess;

  if (!active) return null;

  return (
    <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 2 }}>
      <Tooltip
        withinPortal
        radius="lg"
        label={
          data.isLoading
            ? t('states.loading')
            : isOk
            ? t('states.online', { response: data.data?.status ?? 'N/A' })
            : t('states.offline', { response: data.error?.message })
        }
      >
        <Indicator
          processing={data.isSuccess}
          size={15}
          color={data.isFetching ? 'yellow' : isOk ? 'green' : 'red'}
          children={null}
        />
      </Tooltip>
    </div>
  );
};
