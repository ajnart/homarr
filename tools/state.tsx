// src/context/state.js
import { createContext, ReactNode, useContext, useState } from 'react';
import { Config, serviceItem } from './types';

type configContextType = {
  config: Config;
  setConfig: (newconfig: Config) => void;
  addService: (service: serviceItem) => void;
  removeService: (name: string) => void;
  saveConfig: (newconfig: Config) => void;
};

const configContext = createContext<configContextType>({
  config: {
    services: [],
    settings: {
      searchBar: true,
      searchUrl: 'https://www.google.com/search?q=',
    },
  },
  setConfig: () => {},
  addService: () => {},
  removeService: () => {},
  saveConfig: () => {},
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
    },
  });

  function setConfig(newConfig: Config) {
    setConfigInternal(newConfig);
    saveConfig(newConfig);
  }

  function addService(item: serviceItem) {
    setConfigInternal({
      ...config,
      services: [...config.services, item],
    });
    saveConfig({
      ...config,
      services: [...config.services, item],
    });
  }

  function removeService(name: string) {
    // Remove the service with name in config item
    setConfigInternal({
      ...config,
      services: config.services.filter((service) => service.name !== name),
    });
    saveConfig({
      ...config,
      services: config.services.filter((service) => service.name !== name),
    });
  }

  function saveConfig(newconfig: Config) {
    if (!newconfig) return;
    localStorage.setItem('config', JSON.stringify(newconfig));
  }

  const value = {
    config,
    setConfig,
    addService,
    removeService,
    saveConfig,
  };
  return (
    <>
      <configContext.Provider value={value}>{children}</configContext.Provider>
    </>
  );
}
