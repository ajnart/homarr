import { JsdelivrIconsRepository } from '~/tools/server/images/jsdelivr-icons-repository';
import { LocalIconsRepository } from '~/tools/server/images/local-icons-repository';
import { UnpkgIconsRepository } from '~/tools/server/images/unpkg-icons-repository';
import { GitHubIconsRepository } from '~/tools/server/images/github-icons-repository';

import { createTRPCRouter, publicProcedure } from '../trpc';

export const iconRouter = createTRPCRouter({
  all: publicProcedure.query(async () => {
    const respositories = [
      new LocalIconsRepository(),
      new GitHubIconsRepository(
        GitHubIconsRepository.walkxcode,
        'Walkxcode Dashboard Icons',
        'Walkxcode on Github'
      ),
      new UnpkgIconsRepository(
        UnpkgIconsRepository.tablerRepository,
        'Tabler Icons',
        'Tabler Icons - GitHub (MIT)'
      ),
      new JsdelivrIconsRepository(
        JsdelivrIconsRepository.papirusRepository,
        'Papirus Icons',
        'Papirus Development Team on GitHub (Apache 2.0)'
      ),
      new JsdelivrIconsRepository(
        JsdelivrIconsRepository.homelabSvgAssetsRepository,
        'Homelab Svg Assets',
        'loganmarchione on GitHub (MIT)'
      ),
    ];
    const fetches = respositories.map((rep) => rep.fetch());
    const data = await Promise.all(fetches);
    return data;
  }),
});
