import { Box, Indicator, Tooltip } from '@mantine/core';
import { IconCheck, IconLoader, IconX } from '@tabler/icons-react';
import Consola from 'consola';
import { TargetAndTransition, Transition, motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '~/config/provider';
import { AppType } from '~/types/app';
import { RouterOutputs, api } from '~/utils/api';

interface AppPingProps {
  app: AppType;
}

export const AppPing = ({ app }: AppPingProps) => {
  const { data: sessionData } = useSession();
  const { data: userWithSettings } = api.user.withSettings.useQuery(undefined, {
    enabled: app.network.enabledStatusChecker && !!sessionData?.user,
  });

  const { data, isFetching, isError, error, isActive } = usePing(app);
  const tooltipLabel = useTooltipLabel({ isFetching, isError, data, errorMessage: error?.message });
  const isOnline = isError ? false : data?.state === 'online';

  const pulse = usePingPulse({ isOnline, settings: userWithSettings?.settings });

  if (!isActive) return null;

  const replaceDotWithIcon = userWithSettings?.settings.replacePingWithIcons ?? false;

  return (
    <motion.div
      style={{
        position: 'absolute',
        bottom: replaceDotWithIcon ? 0 : 20,
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
      enabled: isActive,
      refetchOnWindowFocus: false,
      refetchInterval: 1000 * 60,
      cacheTime: 1000 * 30,
      retryOnMount: true,
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

type UsePingPulseProps = {
  isOnline: boolean;
  settings?: RouterOutputs['user']['withSettings']['settings'];
};

const usePingPulse = ({ isOnline, settings }: UsePingPulseProps): PingPulse => {
  const disablePulse = settings?.disablePingPulse ?? false;

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
