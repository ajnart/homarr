// src/context/state.js
import { showNotification } from '@mantine/notifications';
import axios from 'axios';
import { createContext, ReactNode, useContext, useState } from 'react';
import { Check, X } from 'tabler-icons-react';
import { Config } from './types';

type configContextType = {
  config: Config;
  setConfig: (newconfig: Config) => void;
  loadConfig: (name: string) => void;
};

const configContext = createContext<configContextType>({
  config: {
    name: 'default',
    services: [],
    settings: {
      searchBar: true,
      searchUrl: 'https://www.google.com/search?q=',
      enabledModules: [],
    },
  },
  setConfig: () => {},
  loadConfig: async (name: string) => {},
});

export function useConfig() {
  const context = useContext(configContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

type Props = {
  children: ReactNode;
};

export function ConfigProvider({ children }: Props) {
  const [config, setConfigInternal] = useState<Config>({
    name: 'default',
    services: [
      {
        type: 'Other',
        name: 'example',
        icon: 'https://c.tenor.com/o656qFKDzeUAAAAC/rick-astley-never-gonna-give-you-up.gif',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
    ],
    settings: {
      searchBar: true,
      searchUrl: 'https://www.google.com/search?q=',
      enabledModules: [],
    },
  });

  async function loadConfig(configName: string) {
    try {
      const response = await axios.get(`/api/configs/${configName}`);
      console.log('response', response);
      setConfigInternal(response.data);
      showNotification({
        title: 'Config',
        icon: <Check />,
        color: 'green',
        autoClose: 1500,
        radius: 'md',
        message: `Loaded config : ${configName}`,
      });
    } catch (error) {
      showNotification({
        title: 'Config',
        icon: <X />,
        color: 'red',
        autoClose: 1500,
        radius: 'md',
        message: `Error loading config : ${configName}`,
      });
    }
  }

  function setConfig(newconfig: Config) {
    axios.put(`/api/configs/${newconfig.name}`, newconfig);
    setConfigInternal(newconfig);
  }

  const value = {
    config,
    setConfig,
    loadConfig,
  };
  return <configContext.Provider value={value}>{children}</configContext.Provider>;
}
