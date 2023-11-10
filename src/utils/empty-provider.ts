import { OAuthConfig } from 'next-auth/providers';

export default function EmptyNextAuthProvider(): OAuthConfig<any> {
  return {
    id: 'empty',
    name: 'Empty',
    type: 'oauth',
    profile: () => {
      throw new Error(
        'EmptyNextAuthProvider can not be used and is only a placeholder because credentials authentication can not be used as session authentication without additional providers.'
      );
    },
  };
}
