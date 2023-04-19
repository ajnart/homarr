import { Indicator, Tooltip } from '@mantine/core';
import Consola from 'consola';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
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
  const { data, isLoading } = useQuery({
    queryKey: ['ping', { id: app.id, name: app.name }],
    queryFn: async () => {
      const response = await fetch(`/api/modules/ping?url=${encodeURI(app.url)}`);
      const isOk = getIsOk(app, response.status);
      return {
        status: response.status,
        state: isOk ? 'online' : 'down',
      };
    },
    enabled: active,
  });

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
            : t('states.offline', { response: data?.status })
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

const getIsOk = (app: AppType, status: number) => {
if (app.network.okStatus === undefined || app.network.statusCodes.length >= 1) {
Consola.log('Using new status codes');
return app.network.statusCodes.includes(status.toString());
}
Consola.warn('Using deprecated okStatus');
return app.network.okStatus.includes(status);
}
