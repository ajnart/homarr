import { Indicator, Tooltip } from '@mantine/core';
import Consola from 'consola';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { IconCheck, IconCheckbox, IconDownload, IconX } from '@tabler/icons-react';
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

  console.log(
    `app ping for ${app.id} active: ${active ? 'yes' : 'no'} -> [${
      app.network.enabledStatusChecker
    } && ${config?.settings.customization.layout.enabledPing}]`
  );

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

  const disablePulse = config?.settings.customization.accessibility?.disablePingPulse ?? false;
  const replaceDotWithIcon =
    config?.settings.customization.accessibility?.replacePingDotsWithIcons ?? false;

  if (disablePulse) {
    return (
      <div
        style={{
          position: 'absolute',
          bottom: replaceDotWithIcon ? 5 : 20,
          right: replaceDotWithIcon ? 8 : 20,
          zIndex: 2,
        }}
      >
        <IndicatorPing
          isLoading={isLoading}
          isOnline={isOnline}
          statusCode={data?.status ?? 0}
          replaceDotWithIcon={replaceDotWithIcon}
        />
      </div>
    );
  }

  const scaleAnimation = isOnline ? [1, 0.7, 1] : 1;

  return (
    <motion.div
      style={{
        position: 'absolute',
        bottom: replaceDotWithIcon ? 5 : 20,
        right: replaceDotWithIcon ? 8 : 20,
        zIndex: 2,
      }}
      animate={{
        scale: scaleAnimation,
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
        {config?.settings.customization.accessibility?.replacePingDotsWithIcons ? (
          <AccessibleIndicatorPing isLoading={isLoading} isOnline={isOnline} />
        ) : (
          <Indicator
            size={15}
            color={isLoading ? 'yellow' : isOnline ? 'green' : 'red'}
            children={null}
          />
        )}
      </Tooltip>
    </motion.div>
  );
};

const AccessibleIndicatorPing = ({
  isLoading,
  isOnline,
}: {
  isOnline: boolean;
  isLoading: boolean;
}) => {
  if (isOnline) {
    return <IconCheck color="green" />;
  }

  if (isLoading) {
    return <IconDownload />;
  }

  return <IconX color="red" />;
};

const IndicatorPing = ({
  replaceDotWithIcon,
  statusCode,
  isLoading,
  isOnline,
}: {
  replaceDotWithIcon: boolean;
  statusCode: number;
  isLoading: boolean;
  isOnline: boolean;
}) => {
  const { t } = useTranslation('modules/ping');
  return (
    <Tooltip
      withinPortal
      radius="lg"
      label={
        isLoading
          ? t('states.loading')
          : isOnline
          ? t('states.online', { response: statusCode })
          : t('states.offline', { response: statusCode })
      }
    >
      {replaceDotWithIcon ? (
        <IconCheckbox color={isLoading ? 'yellow' : isOnline ? 'green' : 'red'} />
      ) : (
        <Indicator
          size={15}
          color={isLoading ? 'yellow' : isOnline ? 'green' : 'red'}
          children={null}
        />
      )}
    </Tooltip>
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
