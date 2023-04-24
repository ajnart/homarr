import { Indicator, Tooltip } from '@mantine/core';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '../../../../config/provider';
import { trpc } from '../../../../tools/tRPC';
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
  const data = trpc.ping.useQuery(app.url, {
    enabled: active,
  });

  const isOnline = data.isSuccess;

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
          data.isLoading
            ? t('states.loading')
            : isOnline
            ? t('states.online', { response: data.status })
            : t('states.offline', { response: data?.status })
        }
      >
        <Indicator
          size={15}
          color={data.isLoading ? 'yellow' : isOnline ? 'green' : 'red'}
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
