import { Box, Indicator, Tooltip } from '@mantine/core';
import { IconCheck, IconLoader, IconX } from '@tabler/icons-react';
import Consola from 'consola';
import { TargetAndTransition, Transition, motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';
import { RouterOutputs, api } from '~/utils/api';

import { useConfigContext } from '../../../../config/provider';
import { AppType } from '../../../../types/app';

interface AppPingProps {
  app: AppType;
}

export const AppPing = ({ app }: AppPingProps) => {
  const { config } = useConfigContext();

  const { item, isFetching, isActive } = usePing(app);
  const tooltipLabel = useTooltipLabel({ isFetching, item });
  const isOnline = item?.state === 'online';
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
  item: RouterOutputs['app']['pingAll'][number] | undefined;
};

const useTooltipLabel = ({ isFetching, item }: TooltipLabelProps) => {
  const { t } = useTranslation('modules/ping');

  if (isFetching) return t('states.loading');
  if (item?.state === 'error') return item.statusText;
  if (item?.state === 'online') return t('states.online', { response: item?.status ?? 'N/A' });
  return `${item?.statusText}: ${item?.status} (denied)`;
};

const usePing = (app: AppType) => {
  const { config } = useConfigContext();
  const isActive =
    (config?.settings.customization.layout.enabledPing && app.network.enabledStatusChecker) ??
    false;
  const { isFetching, data } = usePingAllQuery();

  return useMemo(() => {
    if (!isActive) return { item: undefined, isFetching: false, isActive };

    const item = data?.find((a) => a.appId === app.id);
    return {
      isFetching,
      item,
      isActive,
    };
  }, [isActive, data, isFetching]);
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

const usePingAllQuery = () => {
  const { name } = useConfigContext();
  return api.app.pingAll.useQuery(
    {
      configName: name ?? '',
    },
    {
      retry: false,
      select: (data) => {
        const errorCount = data.filter((app) => app.state === 'error').length;
        const offlineCount = data.filter((app) => app.state === 'offline').length;
        const onlineCount = data.filter((app) => app.state === 'online').length;

        Consola.info(
          'Ping of all apps returned:\n' +
            `Online: ${onlineCount}\n` +
            `Offline: ${offlineCount}\n` +
            `Error: ${errorCount}\n`
        );

        return data;
      },
    }
  );
};
