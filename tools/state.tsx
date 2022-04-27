// src/context/state.js
import { createContext, ReactNode, useContext, useState } from 'react';
import { serviceItem } from '../components/AppShelf/AppShelf.d';

type servicesContextType = {
  services: serviceItem[];
  setServicesState: (services: serviceItem[]) => void;
  addService: (service: serviceItem) => void;
  removeService: (name: string) => void;
};

const servicesContext = createContext<servicesContextType>({
  services: [],
  setServicesState: () => {},
  addService: () => {},
  removeService: () => {},
});

export function useServices() {
  const context = useContext(servicesContext);
  if (context === undefined) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return context;
}

type Props = {
  children: ReactNode;
};

export function ServicesProvider({ children }: Props) {
  const [services, setServices] = useState<serviceItem[]>([
    {
      type: 'Other',
      name: 'example',
      icon: 'https://c.tenor.com/o656qFKDzeUAAAAC/rick-astley-never-gonna-give-you-up.gif',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
  ]);

  function setServicesState(services: serviceItem[]) {
    setServices(services);
    localStorage.setItem('services', JSON.stringify(services));
  }

  function addService(item: serviceItem) {
    setServices([...services, item]);
    localStorage.setItem('services', JSON.stringify([...services, item]));
  }

  function removeService(name: string) {
    setServices(services.filter((s) => s.name !== name));
    localStorage.setItem('services', JSON.stringify(services.filter((s) => s.name !== name)));
  }

  const value = {
    services,
    setServicesState,
    addService,
    removeService,
  };
  return (
    <>
      <servicesContext.Provider value={value}>{children}</servicesContext.Provider>
    </>
  );
}
