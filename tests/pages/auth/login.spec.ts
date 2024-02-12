import { IncomingMessage, ServerResponse } from 'http';
import { GetServerSidePropsContext } from 'next';
import { SSRConfig } from 'next-i18next';
import { ParsedUrlQuery } from 'querystring';
import { describe, expect, it, vitest } from 'vitest';
import { getServerSideProps } from '~/pages/auth/login';
import * as serverAuthModule from '~/server/auth';

import * as getServerSideTranslationsModule from '../../../src/tools/server/getServerSideTranslations';

vitest.mock('./../../server/auth.ts', () => ({
  getServerAuthSession: () => null,
}));

vitest.mock('./../../tools/server/getServerSideTranslations.ts', () => ({
  getServerSideTranslations: () => null,
}));

describe('login page', () => {
  it('getServerSideProps should return null redirectAfterLogin when no query value', async () => {
    // arrange
    vitest.spyOn(serverAuthModule, 'getServerAuthSession').mockReturnValue(Promise.resolve(null));
    vitest
      .spyOn(getServerSideTranslationsModule, 'getServerSideTranslations')
      .mockReturnValue(Promise.resolve({ _i18Next: 'hello' } as unknown as SSRConfig));

    // act
    const response = await getServerSideProps({
      query: {},
      locale: 'de-DE',
      req: {},
      res: {},
    } as GetServerSidePropsContext<ParsedUrlQuery>);

    // assert
    expect(response).toStrictEqual({
      props: {
        redirectAfterLogin: null,
        isDemo: false,
        _i18Next: 'hello',
        oidcAutoLogin: null,
        oidcProviderName: null,
        providers: undefined
      },
    });

    expect(serverAuthModule.getServerAuthSession).toHaveBeenCalledOnce();
    expect(getServerSideTranslationsModule.getServerSideTranslations).toHaveBeenCalledOnce();
    expect(getServerSideTranslationsModule.getServerSideTranslations).toHaveBeenCalledWith(
      ['authentication/login'],
      'de-DE',
      {},
      {}
    );
  });

  it('getServerSideProps should return url when redirectAfterLogin is local and valid', async () => {
    // arrange
    vitest.spyOn(serverAuthModule, 'getServerAuthSession').mockReturnValue(Promise.resolve(null));
    vitest
      .spyOn(getServerSideTranslationsModule, 'getServerSideTranslations')
      .mockReturnValue(Promise.resolve({ _i18Next: 'hello' } as unknown as SSRConfig));

    // act
    const response = await getServerSideProps({
      query: {
        redirectAfterLogin: '/manage/users/create',
      },
      locale: 'de-DE',
      req: {} as IncomingMessage & { cookies: Partial<{ [key: string]: string }> },
      res: {} as ServerResponse<IncomingMessage>,
      resolvedUrl: '/auth/login',
    } as GetServerSidePropsContext<ParsedUrlQuery>);

    // assert
    expect(response).toStrictEqual({
      props: {
        redirectAfterLogin: '/manage/users/create',
        isDemo: false,
        _i18Next: 'hello',
        oidcAutoLogin: null,
        oidcProviderName: null,
        providers: undefined
      },
    });

    expect(serverAuthModule.getServerAuthSession).toHaveBeenCalledOnce();
    expect(getServerSideTranslationsModule.getServerSideTranslations).toHaveBeenCalledOnce();
    expect(getServerSideTranslationsModule.getServerSideTranslations).toHaveBeenCalledWith(
      ['authentication/login'],
      'de-DE',
      {},
      {}
    );
  });

  it('getServerSideProps should return null when url does not match regex', async () => {
    // arrange
    vitest.spyOn(serverAuthModule, 'getServerAuthSession').mockReturnValue(Promise.resolve(null));
    vitest
      .spyOn(getServerSideTranslationsModule, 'getServerSideTranslations')
      .mockReturnValue(Promise.resolve({ _i18Next: 'hello' } as unknown as SSRConfig));

    // act
    const response = await getServerSideProps({
      query: {
        redirectAfterLogin: "data:text/html,<script>alert('hi');</script>",
      },
      locale: 'de-DE',
      req: {} as IncomingMessage & { cookies: Partial<{ [key: string]: string }> },
      res: {} as ServerResponse<IncomingMessage>,
      resolvedUrl: '/auth/login',
    } as GetServerSidePropsContext<ParsedUrlQuery>);

    // assert
    expect(response).toStrictEqual({
      props: {
        redirectAfterLogin: null,
        isDemo: false,
        _i18Next: 'hello',
        oidcAutoLogin: null,
        oidcProviderName: null,
        providers: undefined
      },
    });

    expect(serverAuthModule.getServerAuthSession).toHaveBeenCalledOnce();
    expect(getServerSideTranslationsModule.getServerSideTranslations).toHaveBeenCalledOnce();
    expect(getServerSideTranslationsModule.getServerSideTranslations).toHaveBeenCalledWith(
      ['authentication/login'],
      'de-DE',
      {},
      {}
    );
  });
});
