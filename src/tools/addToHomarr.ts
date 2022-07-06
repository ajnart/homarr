import Dockerode from 'dockerode';
import { Config } from './types';

async function MatchIcon(name: string) {
  const res = await fetch(
    `https://cdn.jsdelivr.net/gh/walkxhub/dashboard-icons/png/${name
      .replace(/\s+/g, '-')
      .toLowerCase()}.png`
  );
  return res.ok ? res.url : '/favicon.svg';
}

function tryMatchType(imageName: string) {
  // Search for a match with the Image name from the MATCH_TYPES array
  console.log(`Trying to match type for: ${imageName}`);
  return 'Other';
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
        url: `${container.Ports.at(0)?.IP}:${container.Ports.at(0)?.PublicPort}`,
        icon: await MatchIcon(container.Names[0].substring(1)),
      },
    ],
  });
}
