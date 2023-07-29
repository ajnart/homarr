import { Badge, Button, Menu } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconInfoCircle,
  IconLogin,
  IconLogout,
  IconMenu2,
  IconSettings,
} from '@tabler/icons-react';
import { signOut, useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';

import { useEditModeInformationStore } from '../../../hooks/useEditModeInformation';
import { AboutModal } from '../../Dashboard/Modals/AboutModal/AboutModal';
import { SettingsDrawer } from '../../Settings/SettingsDrawer';
import { useCardStyles } from '../useCardStyles';
import { ColorSchemeSwitch } from './SettingsMenu/ColorSchemeSwitch';

export function SettingsMenu({ newVersionAvailable }: { newVersionAvailable: string }) {
  const [drawerOpened, drawer] = useDisclosure(false);
  const { t } = useTranslation('common');
  const [aboutModalOpened, aboutModal] = useDisclosure(false);
  const { classes } = useCardStyles(true);
  const { editModeEnabled } = useEditModeInformationStore();
  const { data: sessionData } = useSession();

  return (
    <>
      <Menu width={250}>
        <Menu.Target>
          <Button className={classes.card} variant="default" radius="md" style={{ height: 43 }}>
            <IconMenu2 />
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <ColorSchemeSwitch />
          {!editModeEnabled && (
            <Menu.Item icon={<IconSettings strokeWidth={1.2} size={18} />} onClick={drawer.open}>
              {t('sections.settings')}
            </Menu.Item>
          )}
          <Menu.Item
            icon={<IconInfoCircle strokeWidth={1.2} size={18} />}
            rightSection={
              newVersionAvailable && (
                <Badge variant="light" color="blue">
                  New
                </Badge>
              )
            }
            onClick={() => aboutModal.open()}
          >
            {t('about')}
          </Menu.Item>
          {sessionData?.user ? (
            <Menu.Item icon={<IconLogout strokeWidth={1.2} size={18} />} onClick={() => signOut()}>
              {t('header.logout')}
            </Menu.Item>
          ) : (
            <Menu.Item
              icon={<IconLogin strokeWidth={1.2} size={18} />}
              component={Link}
              href="/login"
            >
              {t('header.sign-in')}
            </Menu.Item>
          )}
        </Menu.Dropdown>
      </Menu>
      <SettingsDrawer
        opened={drawerOpened}
        closeDrawer={drawer.close}
        newVersionAvailable={newVersionAvailable}
      />
      <AboutModal
        opened={aboutModalOpened}
        closeModal={aboutModal.close}
        newVersionAvailable={newVersionAvailable}
      />
    </>
  );
}
