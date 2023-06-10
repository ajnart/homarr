import { Indicator, Tooltip } from '@mantine/core';
import Consola from 'consola';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '../../../../config/provider';
import { AppType } from '../../../../types/app';
import { api } from '~/utils/api';

interface AppPingProps {
  app: AppType;
}

export const AppPing = ({ app }: AppPingProps) => {
  const { t } = useTranslation('modules/ping');
  const { config } = useConfigContext();
  const active =
    (config?.settings.customization.layout.enabledPing && app.network.enabledStatusChecker) ??
    false;
  const { data, isLoading, error } = usePingQuery(app, active);

  const isOnline = data?.state === 'online';

  if (!active) return null;

  return (
    <motion.div
      style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 2 }}
      animate={{
        scale: isOnline ? [1, 0.7, 1] : 1,
      }}
      transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
    >
      <Tooltip
        withinPortal
        radius="lg"
        label={
          isLoading
            ? t('states.loading')
            : isOnline
            ? t('states.online', { response: data.status })
            : t('states.offline', { response: data?.status ?? error?.data?.httpStatus })
        }
      >
        <Indicator
          size={15}
          color={isLoading ? 'yellow' : isOnline ? 'green' : 'red'}
          children={null}
        />
      </Tooltip>
    </motion.div>
  );
};

const usePingQuery = (app: AppType, isEnabled: boolean) =>
  api.app.ping.useQuery(
    {
      url: app.url,
    },
    {
      enabled: isEnabled,
      select: (data) => {
        const statusCode = data.status;
        const isOk = getIsOk(app, statusCode);
        return {
          status: statusCode,
          state: isOk ? ('online' as const) : ('down' as const),
        };
      },
    }
  );

const getIsOk = (app: AppType, status: number) => {
  if (app.network.okStatus === undefined || app.network.statusCodes.length >= 1) {
    Consola.log('Using new status codes');
    return app.network.statusCodes.includes(status.toString());
  }
  Consola.warn('Using deprecated okStatus');
  return app.network.okStatus.includes(status);
};
