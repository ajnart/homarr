import { ActionIcon, Menu, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconInfoCircle, IconMenu2, IconSettings } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { AboutModal } from '../../About/AboutModal';
import { SettingsDrawer } from '../../Settings/SettingsDrawer';
import { ColorSchemeSwitch } from './SettingsMenu/ColorSchemeSwitch';

export const SettingsMenu = () => {
  const [drawerOpened, drawer] = useDisclosure(false);
  const { t } = useTranslation('common');
  const [aboutModalOpened, aboutModal] = useDisclosure(false);

  return (
    <>
      <Tooltip label="Open Menu">
        <Menu width={250}>
          <Menu.Target>
            <ActionIcon variant="default" radius="md" size="xl" color="blue">
              <IconMenu2 />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <ColorSchemeSwitch />
            <Menu.Divider />
            <Menu.Item icon={<IconSettings strokeWidth={1.2} size={18} />} onClick={drawer.open}>
              {t('sections.settings')}
            </Menu.Item>
            <Menu.Item
              icon={<IconInfoCircle strokeWidth={1.2} size={18} />}
              onClick={aboutModal.open}
            >
              About
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Tooltip>
      <SettingsDrawer opened={drawerOpened} closeDrawer={drawer.close} />
      <AboutModal opened={aboutModalOpened} closeModal={aboutModal.close} />
    </>
  );
};
