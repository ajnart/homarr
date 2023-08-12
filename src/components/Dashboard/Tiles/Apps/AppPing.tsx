import { Box, Indicator, Tooltip } from '@mantine/core';
import { IconCheck, IconLoader, IconX } from '@tabler/icons-react';
import Consola from 'consola';
import { TargetAndTransition, Transition, motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { RouterOutputs, api } from '~/utils/api';

import { useConfigContext } from '../../../../config/provider';
import { AppType } from '../../../../types/app';

interface AppPingProps {
  app: AppType;
}

export const AppPing = ({ app }: AppPingProps) => {
  const { config } = useConfigContext();

  const { data, isFetching, isError, error, isActive } = usePing(app);
  const tooltipLabel = useTooltipLabel({ isFetching, isError, data, errorMessage: error?.message });
  const isOnline = isError ? false : data?.state === 'online';
  const pulse = usePingPulse({ isOnline });

  if (!isActive) return null;

  const replaceDotWithIcon =
    config?.settings.customization.accessibility?.replacePingDotsWithIcons ?? false;

  return (
    <motion.div
      style={{
        position: 'absolute',
        bottom: replaceDotWithIcon ? 5 : 20,
        right: replaceDotWithIcon ? 8 : 20,
        zIndex: 2,
      }}
      animate={pulse.animate}
      transition={pulse.transition}
    >
      <Tooltip withinPortal radius="lg" label={tooltipLabel}>
        {replaceDotWithIcon ? (
          <Box>
            <AccessibleIndicatorPing isFetching={isFetching} isOnline={isOnline} />
          </Box>
        ) : (
          <Indicator
            size={15}
            color={isFetching ? 'yellow' : isOnline ? 'green' : 'red'}
            children={null}
          />
        )}
      </Tooltip>
    </motion.div>
  );
};

type AccessibleIndicatorPingProps = {
  isOnline: boolean;
  isFetching: boolean;
};

const AccessibleIndicatorPing = ({ isFetching, isOnline }: AccessibleIndicatorPingProps) => {
  if (isOnline) {
    return <IconCheck color="green" />;
  }

  if (isFetching) {
    return <IconLoader />;
  }

  return <IconX color="red" />;
};

export const isStatusOk = (app: AppType, status: number) => {
  if (app.network.okStatus === undefined || app.network.statusCodes.length >= 1) {
    return app.network.statusCodes.includes(status.toString());
  }
  return app.network.okStatus.includes(status);
};

type TooltipLabelProps = {
  isFetching: boolean;
  isError: boolean;
  data: RouterOutputs['app']['ping'] | undefined;
  errorMessage: string | undefined;
};

const useTooltipLabel = ({ isFetching, isError, data, errorMessage }: TooltipLabelProps) => {
  const { t } = useTranslation('modules/ping');

  if (isFetching) return t('states.loading');
  if (isError) return errorMessage;
  if (data?.state === 'online') return t('states.online', { response: data?.status ?? 'N/A' });
  return `${data?.statusText}: ${data?.status} (denied)`;
};

const usePing = (app: AppType) => {
  const { config, name } = useConfigContext();
  const isActive =
    (config?.settings.customization.layout.enabledPing && app.network.enabledStatusChecker) ??
    false;

  const queryResult = api.app.ping.useQuery(
    {
      id: app.id,
      configName: name ?? '',
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
      retryDelay(failureCount, error) {
        // TODO: Add logic to retry on timeout
        return 3000;
      },
      // 5 minutes of cache
      cacheTime: 1000 * 60 * 5,
      staleTime: 1000 * 60 * 5,
      retryOnMount: true,
      enabled: isActive,

      select: (data) => {
        const isOk = isStatusOk(app, data.status);
        if (isOk)
          Consola.info(`Ping of app "${app.name}" (${app.url}) returned ${data.status} (Accepted)`);
        else
          Consola.warn(`Ping of app "${app.name}" (${app.url}) returned ${data.status} (Refused)`);
        return {
          status: data.status,
          state: isOk ? ('online' as const) : ('down' as const),
          statusText: data.statusText,
        };
      },
    }
  );

  return {
    ...queryResult,
    isActive,
  };
};

type PingPulse = {
  animate?: TargetAndTransition;
  transition?: Transition;
};

const usePingPulse = ({ isOnline }: { isOnline: boolean }): PingPulse => {
  const { config } = useConfigContext();
  const disablePulse = config?.settings.customization.accessibility?.disablePingPulse ?? false;

  if (disablePulse) {
    return {};
  }

  return {
    animate: {
      scale: isOnline ? [1, 0.7, 1] : 1,
    },
    transition: {
      repeat: Infinity,
      duration: 2.5,
      ease: 'easeInOut',
    },
  };
};
