import { Indicator, Tooltip } from '@mantine/core';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Plug } from 'tabler-icons-react';
import { useConfig } from '../../../tools/state';
import { IModule } from '../modules';

export const PingModule: IModule = {
  title: 'Ping Services',
  description: 'Pings your services and shows their status as an indicator',
  icon: Plug,
  component: PingComponent,
};

export default function PingComponent(props: any) {
  type State = 'loading' | 'down' | 'online';
  const { config } = useConfig();

  const { url }: { url: string } = props;
  const [isOnline, setOnline] = useState<State>('loading');
  useEffect(() => {
    if (!config.settings.enabledModules.includes('Ping Services')) {
      return;
    }
    axios
      .get('/api/modules/ping', { params: { url } })
      .then(() => {
        setOnline('online');
      })
      .catch(() => {
        setOnline('down');
      });
  }, []);
  if (!config.settings.enabledModules.includes('Ping Services')) {
    return null;
  }
  return (
    <Tooltip
      radius="lg"
      style={{ position: 'absolute', bottom: 20, right: 20 }}
      label={isOnline === 'loading' ? 'Loading...' : isOnline === 'online' ? 'Online' : 'Offline'}
    >
      <motion.div
        animate={{
          scale: isOnline === 'online' ? [1, 0.8, 1] : 1,
        }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
      >
        <Indicator
          size={13}
          color={isOnline === 'online' ? 'green' : isOnline === 'down' ? 'red' : 'yellow'}
        >
          {null}
        </Indicator>
      </motion.div>
    </Tooltip>
  );
}
