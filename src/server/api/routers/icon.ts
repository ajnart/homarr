import { GitHubIconsRepository } from '~/tools/server/images/github-icons-repository';
import { JsdelivrIconsRepository } from '~/tools/server/images/jsdelivr-icons-repository';
import { LocalIconsRepository } from '~/tools/server/images/local-icons-repository';
import { UnpkgIconsRepository } from '~/tools/server/images/unpkg-icons-repository';

import { createTRPCRouter, publicProcedure } from '../trpc';
import { z } from 'zod';
import { NormalizedIconRepositoryResult } from '~/tools/server/images/abstract-icons-repository';

export const IconRespositories = [
  new LocalIconsRepository(),
  new GitHubIconsRepository(
    GitHubIconsRepository.walkxcode,
    'Walkxcode Dashboard Icons',
    'Walkxcode on Github',
  ),
  new UnpkgIconsRepository(
    UnpkgIconsRepository.tablerRepository,
    'Tabler Icons',
    'Tabler Icons - GitHub (MIT)',
  ),
  new JsdelivrIconsRepository(
    JsdelivrIconsRepository.papirusRepository,
    'Papirus Icons',
    'Papirus Development Team on GitHub (Apache 2.0)',
  ),
  new JsdelivrIconsRepository(
    JsdelivrIconsRepository.homelabSvgAssetsRepository,
    'Homelab Svg Assets',
    'loganmarchione on GitHub (MIT)',
  ),
];

export const iconRouter = createTRPCRouter({
  all: publicProcedure
    .meta({ openapi: { method: 'GET', path: '/icons', tags: ['icon'] } })
    .input(z.void())
    .output(z.array(z.custom<NormalizedIconRepositoryResult>()))
    .query(async () => {
      const fetches = IconRespositories.map((rep) => rep.fetch());
      return await Promise.all(fetches);
    }),
});
