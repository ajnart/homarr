import { NextApiRequest, NextApiResponse } from 'next';
import { SSRConfig } from 'next-i18next';
import { ParsedUrlQuery } from 'querystring';
import { describe, expect, it, vitest } from 'vitest';
import * as serverAuthModule from '~/server/auth';
import { ConfigType } from '~/types/config';

import { getServerSideProps } from '../../../src/pages/board/[slug]';
import * as configExistsModule from '../../../src/tools/config/configExists';
import * as getFrontendConfigModule from '../../../src/tools/config/getFrontendConfig';
import * as getServerSideTranslationsModule from '../../../src/tools/server/getServerSideTranslations';

vitest.mock('./../../server/auth.ts', () => ({
  getServerAuthSession: () => null,
}));

vitest.mock('./../../tools/config/getFrontendConfig.ts', () => ({
  getFrontendConfig: (board: string) => null,
}));

vitest.mock('./../../tools/config/configExists.ts', () => ({
  configExists: (board: string) => null,
}));

vitest.mock('./../../env.js', () => import.meta);

vitest.mock('./../../tools/server/getServerSideTranslations.ts', () => ({
  getServerSideTranslations: () => null,
}));

vitest.mock('../../../src/server/api/routers/docker/router.ts', () => ({
  dockerRouter: () => null,
}));

describe('[slug] page', () => {
  it('getServerSideProps should return not found when no params', async () => {
    // arrange
    vitest.spyOn(configExistsModule, 'configExists').mockReturnValue(false);
    vitest
      .spyOn(getFrontendConfigModule, 'getFrontendConfig')
      .mockReturnValue(Promise.resolve(null as unknown as ConfigType));
    vitest
      .spyOn(getServerSideTranslationsModule, 'getServerSideTranslations')
      .mockReturnValue(Promise.resolve(null as unknown as SSRConfig));
    vitest.spyOn(serverAuthModule, 'getServerAuthSession').mockReturnValue(Promise.resolve(null));

    // act
    const response = await getServerSideProps({
      req: {} as NextApiRequest,
      res: {} as NextApiResponse,
      query: {} as ParsedUrlQuery,
      resolvedUrl: '/board/testing-board',
    });

    // assert
    expect(response).toStrictEqual({
      notFound: true,
    });
    expect(configExistsModule.configExists).not.toHaveBeenCalled();
    expect(getFrontendConfigModule.getFrontendConfig).not.toHaveBeenCalled();
  });

  it('getServerSideProps should return not found when invalid params', async () => {
    // arrange
    vitest.spyOn(configExistsModule, 'configExists').mockReturnValue(false);
    vitest
      .spyOn(getFrontendConfigModule, 'getFrontendConfig')
      .mockReturnValue(Promise.resolve(null as unknown as ConfigType));
    vitest
      .spyOn(getServerSideTranslationsModule, 'getServerSideTranslations')
      .mockReturnValue(Promise.resolve(null as unknown as SSRConfig));
    vitest.spyOn(serverAuthModule, 'getServerAuthSession').mockReturnValue(Promise.resolve(null));

    // act
    const response = await getServerSideProps({
      req: {} as NextApiRequest,
      res: {} as NextApiResponse,
      query: {
        test: 'test',
      },
      resolvedUrl: '/board/testing-board',
    });

    expect(response).toStrictEqual({
      notFound: true,
    });
    expect(configExistsModule.configExists).not.toHaveBeenCalled();
    expect(getFrontendConfigModule.getFrontendConfig).not.toHaveBeenCalled();
  });

  it('getServerSideProps should return not found when valid params but no config with said name', async () => {
    // arrange
    vitest.spyOn(configExistsModule, 'configExists').mockReturnValue(false);
    vitest
      .spyOn(getFrontendConfigModule, 'getFrontendConfig')
      .mockReturnValueOnce(Promise.resolve(null as unknown as ConfigType));
    vitest
      .spyOn(getServerSideTranslationsModule, 'getServerSideTranslations')
      .mockReturnValue(Promise.resolve(null as unknown as SSRConfig));
    vitest.spyOn(serverAuthModule, 'getServerAuthSession').mockReturnValue(Promise.resolve(null));

    // act
    const response = await getServerSideProps({
      req: {} as NextApiRequest,
      res: {} as NextApiResponse,
      query: {},
      params: {
        slug: 'testing-board',
      },
      resolvedUrl: '/board/testing-board',
    });

    // assert
    expect(response).toStrictEqual({
      notFound: true,
    });
    expect(configExistsModule.configExists).toHaveBeenCalledOnce();
    expect(getFrontendConfigModule.getFrontendConfig).not.toHaveBeenCalled();
  });

  it('getServerSideProps should return when valid params and config', async () => {
    // arrange
    vitest.spyOn(configExistsModule, 'configExists').mockReturnValue(true);
    vitest.spyOn(getFrontendConfigModule, 'getFrontendConfig').mockReturnValueOnce(
      Promise.resolve({
        settings: {
          access: {
            allowGuests: false,
          },
          customization: {
            colors: {
              primary: 'red',
              secondary: 'blue',
              shade: 'green',
            },
          },
        },
      } as unknown as ConfigType)
    );
    vitest
      .spyOn(serverAuthModule, 'getServerAuthSession')
      .mockReturnValueOnce(Promise.resolve(null));
    vitest
      .spyOn(getServerSideTranslationsModule, 'getServerSideTranslations')
      .mockReturnValue(Promise.resolve(null as unknown as SSRConfig));

    // act
    const response = await getServerSideProps({
      req: {} as NextApiRequest,
      res: {} as NextApiResponse,
      query: {},
      params: {
        slug: 'my-authentication-board',
      },
      resolvedUrl: '/board/my-authentication-board',
    });

    // assert
    expect(response).toEqual({
      redirect: {
        destination: '/auth/login?redirectAfterLogin=/board/my-authentication-board',
        permanent: false,
      },
    });
    expect(serverAuthModule.getServerAuthSession).toHaveBeenCalledOnce();
    expect(configExistsModule.configExists).toHaveBeenCalledOnce();
    expect(getFrontendConfigModule.getFrontendConfig).toHaveBeenCalledOnce();
  });
});
