import Dockerode from 'dockerode';
import { MatchingImages, ServiceType, tryMatchPort } from './types';

function tryMatchType(imageName: string): ServiceType {
  // Try to find imageName inside MatchingImages

  const match = MatchingImages.find(({ image }) => imageName.includes(image));
  if (match) {
    return match.type;
  }
  return 'Other';
}

export function tryMatchService(container: Dockerode.ContainerInfo | undefined) {
  if (container === undefined) return {};
  const name = container.Names[0].substring(1);
  const type = tryMatchType(container.Image);
  const port = tryMatchPort(type.toLowerCase())?.value ?? container.Ports[0]?.PublicPort;
  return {
    name,
    id: container.Id,
    type: tryMatchType(container.Image),
    url: `localhost${port ? `:${port}` : ''}`,
    icon: `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/${name
      .replace(/\s+/g, '-')
      .toLowerCase()}.png`,
  };
}
