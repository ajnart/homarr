import { DockerContainer } from '@homarr/graphql';
import Dockerode from 'dockerode';
import { Config, MatchingImages, ServiceType, tryMatchPort } from './types';

async function MatchIcon(name: string) {
  const res = await fetch(
    `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/${name
      .replace(/\s+/g, '-')
      .toLowerCase()}.png`
  );
  return res.ok ? res.url : '/favicon.png';
}

function tryMatchType(imageName: string): ServiceType {
  // Try to find imageName inside MatchingImages

  const match = MatchingImages.find(({ image }) => imageName.includes(image));
  if (match) {
    return match.type;
  }
  return 'Other';
}

export function tryMatchService(container: DockerContainer | undefined) {
  if (container === undefined) return {};
  const { name } = container;
  const type = tryMatchType(container.image);
  const port = tryMatchPort(type.toLowerCase())?.value ?? container.ports[0]?.public;
  return {
    name,
    id: container.id,
    type: tryMatchType(container.image),
    url: `localhost${port ? `:${port}` : ''}`,
    icon: `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/${name
      .replace(/\s+/g, '-')
      .toLowerCase()}.png`,
  };
}

export default async function addToHomarr(
  container: Dockerode.ContainerInfo,
  config: Config,
  setConfig: (newconfig: Config) => void
) {
  setConfig({
    ...config,
    services: [
      ...config.services,
      {
        name: container.Names[0].substring(1),
        id: container.Id,
        type: tryMatchType(container.Image),
        url: `localhost:${container.Ports.at(0)?.PublicPort}`,
        icon: await MatchIcon(container.Names[0].substring(1)),
      },
    ],
  });
}
