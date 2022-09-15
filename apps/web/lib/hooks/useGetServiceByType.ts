import { useConfig } from '../state';
import { Config, ServiceType } from '../types';

export const useGetServiceByType = (...serviceTypes: ServiceType[]) => {
  const { config } = useConfig();

  return getServiceByType(config, ...serviceTypes);
};

export const getServiceByType = (config: Config, ...serviceTypes: ServiceType[]) =>
  config.services.filter((s) => serviceTypes.includes(s.type));

export const getServiceById = (config: Config, id: string) =>
  config.services.find((s) => s.id === id);
