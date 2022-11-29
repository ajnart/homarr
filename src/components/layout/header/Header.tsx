import { Group, Header as Head, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { AddItemShelfButton } from '../../AppShelf/AddAppShelfItem';

import DockerMenuButton from '../../../modules/docker/DockerModule';
import { SettingsMenuButton } from '../../Settings/SettingsMenu';
import { Logo } from '../Logo';
import { useConfig } from '../../../tools/state';
import { SearchModuleComponent } from '../../../modules/search/SearchModule';

export function Header(props: any) {
  const { width } = useViewportSize();
  const MIN_WIDTH_MOBILE = useMantineTheme().breakpoints.xs;
  const { config } = useConfig();
  const { colorScheme } = useMantineColorScheme();

  return (
    <Head
      height="auto"
      style={{
        background: `rgba(${colorScheme === 'dark' ? '37, 38, 43,' : '255, 255, 255,'} \
      ${(config.settings.appOpacity || 100) / 100}`,
        borderColor: `rgba(${colorScheme === 'dark' ? '37, 38, 43,' : '233, 236, 239,'} \
      ${(config.settings.appOpacity || 100) / 100}`,
      }}
    >
      <Group p="xs" noWrap grow>
        {width > MIN_WIDTH_MOBILE && <Logo style={{ fontSize: 22 }} />}
        <Group position="right" noWrap>
          <SearchModuleComponent />
          <DockerMenuButton />
          <SettingsMenuButton />
          <AddItemShelfButton />
        </Group>
      </Group>
    </Head>
  );
}
