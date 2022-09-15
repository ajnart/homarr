import { GetConfigDocument, GetConfigQuery, GetConfigQueryVariables } from '@homarr/graphql';
import { client } from './apolloClient';

export const getConfig = async (name: string, props: any = undefined) => {
  const { data } = await client.query<GetConfigQuery, GetConfigQueryVariables>({
    query: GetConfigDocument,
    variables: {
      configName: name,
    },
  });

  // Print loaded config
  return {
    props: {
      configName: name,
      config: data.config,
      ...props,
    },
  };
};
