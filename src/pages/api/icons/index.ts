import { NextApiRequest, NextApiResponse } from 'next';
import { JsdelivrIconsRepository } from '../../../tools/server/images/jsdelivr-icons-repository';
import { LocalIconsRepository } from '../../../tools/server/images/local-icons-repository';
import { UnpkgIconsRepository } from '../../../tools/server/images/unpkg-icons-repository';

const Get = async (request: NextApiRequest, response: NextApiResponse) => {
  const respositories = [
    new LocalIconsRepository(),
    new JsdelivrIconsRepository(JsdelivrIconsRepository.tablerRepository, 'Walkxcode Dashboard Icons', 'Walkxcode on Github'),
    new UnpkgIconsRepository(UnpkgIconsRepository.tablerRepository, 'Tabler Icons', 'Tabler Icons - GitHub (MIT)'),
    new JsdelivrIconsRepository(JsdelivrIconsRepository.papirusRepository, 'Papirus Icons', 'Papirus Development Team on GitHub (Apache 2.0)'),
    new JsdelivrIconsRepository(JsdelivrIconsRepository.homelabSvgAssetsRepository, 'Homelab Svg Assets', 'loganmarchione on GitHub (MIT)'),
  ];
  const fetches = respositories.map((rep) => rep.fetch());
  const data = await Promise.all(fetches);
  return response.status(200).json(data);
};

export default async (request: NextApiRequest, response: NextApiResponse) => {
  if (request.method === 'GET') {
    return Get(request, response);
  }
  return response.status(405).json({
    statusCode: 405,
    message: 'Method not allowed',
  });
};
