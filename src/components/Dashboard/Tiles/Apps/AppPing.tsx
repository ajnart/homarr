import { Indicator, Tooltip } from '@mantine/core';
import Consola from 'consola';
import { motion } from 'framer-motion';
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
  const { data, isLoading } = api.ping.url.useQuery(
    {
      url: app.url,
    },
    {
      select: (data) => ({
        isOnline: getIsOk(app, data.statusCode),
        statusCode: data.statusCode,
      }),
      enabled: active,
    }
  );

  if (!active) return null;

  return (
    <motion.div
      style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 2 }}
      animate={{
        scale: data?.isOnline ? [1, 0.7, 1] : 1,
      }}
      transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
    >
      <Tooltip
        withinPortal
        radius="lg"
        label={
          isLoading
            ? t('states.loading')
            : data?.isOnline
            ? t('states.online', { response: data.statusCode })
            : t('states.offline', { response: data?.statusCode })
        }
      >
        <Indicator
          size={15}
          color={isLoading ? 'yellow' : data?.isOnline ? 'green' : 'red'}
          children={null}
        />
      </Tooltip>
    </motion.div>
  );
};

const getIsOk = (app: AppType, status: number) => {
  if (app.network.okStatus === undefined || app.network.statusCodes.length >= 1) {
    Consola.log('Using new status codes');
    return app.network.statusCodes.includes(status.toString());
  }
  Consola.warn('Using deprecated okStatus');
  return app.network.okStatus.includes(status);
};
