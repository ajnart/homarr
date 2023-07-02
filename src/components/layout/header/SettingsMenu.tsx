import { Badge, Button, Menu } from '@mantine/core';
import { useDisclosure, useHotkeys } from '@mantine/hooks';
import {
  IconInfoCircle,
  IconMenu2,
  IconPlug,
  IconPlugConnected,
  IconSettings,
} from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { IntegrationMenu, IntegrationModal } from '~/components/Config/Integration/IntegrationModal';

import { useEditModeInformationStore } from '../../../hooks/useEditModeInformation';
import { AboutModal } from '../../Dashboard/Modals/AboutModal/AboutModal';
import { SettingsDrawer } from '../../Settings/SettingsDrawer';
import { useCardStyles } from '../useCardStyles';
import { ColorSchemeSwitch } from './SettingsMenu/ColorSchemeSwitch';
import { EditModeToggle } from './SettingsMenu/EditModeToggle';

export function SettingsMenu({ newVersionAvailable }: { newVersionAvailable: string }) {
  const [drawerOpened, drawer] = useDisclosure(false);
  const { t } = useTranslation('common');
  const [integrationsModalOpened, integrationsModal] = useDisclosure(false);
  const [aboutModalOpened, aboutModal] = useDisclosure(false);
  const { classes } = useCardStyles(true);
  const { editModeEnabled } = useEditModeInformationStore();
  useHotkeys([['mod+o', () => integrationsModal.toggle()]]);

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
          <EditModeToggle />
          <Menu.Divider />
          {!editModeEnabled && (
            <Menu.Item icon={<IconSettings strokeWidth={1.2} size={18} />} onClick={drawer.open}>
              {t('sections.settings')}
            </Menu.Item>
          )}
         <IntegrationMenu integrationsModal={integrationsModal}/>
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
        </Menu.Dropdown>
      </Menu>
      <SettingsDrawer
        opened={drawerOpened}
        closeDrawer={drawer.close}
        newVersionAvailable={newVersionAvailable}
      />
      <IntegrationModal opened={integrationsModalOpened} closeModal={integrationsModal.close} />
      <AboutModal
        opened={aboutModalOpened}
        closeModal={aboutModal.close}
        newVersionAvailable={newVersionAvailable}
      />
    </>
  );
}
