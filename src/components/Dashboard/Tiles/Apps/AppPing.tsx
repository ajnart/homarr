import { Box, Indicator } from '@mantine/core';
import { IconCheck, IconLoader, IconX } from '@tabler/icons-react';
import { TargetAndTransition, Transition, motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
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
  const isOnline = data === true ? true : false;

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
      // 5 minutes of cache
      cacheTime: 1000 * 60 * 5,
      staleTime: 1000 * 60 * 5,
      retryOnMount: true,
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
