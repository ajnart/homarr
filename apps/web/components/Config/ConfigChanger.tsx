import { useGetConfigListQuery } from '@homarr/graphql';
import { Center, Loader, Select, Tooltip } from '@mantine/core';
import { setCookie } from 'cookies-next';
import { useTranslation } from 'next-i18next';
import { useConfig } from '../../lib/state';

export default function ConfigChanger() {
  const { config, loadConfig, setConfig, getConfigs } = useConfig();

  const { t } = useTranslation('settings/general/config-changer');

  const { data, loading } = useGetConfigListQuery();

  // If configlist is empty, return a loading indicator
  if (loading) {
    return (
      <Tooltip label={"Loading your configs. This doesn't load in vercel."}>
        <Center>
          <Loader />
        </Center>
      </Tooltip>
    );
  }

  return (
    <Select
      label={t('configSelect.label')}
      defaultValue={config.name}
      onChange={(e) => {
        loadConfig(e ?? 'default');
        setCookie('config-name', e ?? 'default', {
          maxAge: 60 * 60 * 24 * 30,
          sameSite: 'strict',
        });
      }}
      data={
        // If config list is empty, return the current config
        !data?.configs.length ? [config.name] : data.configs.map((cfg) => cfg.name)
      }
    />
  );
}
