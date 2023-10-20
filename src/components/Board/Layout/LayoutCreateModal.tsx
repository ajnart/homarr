import { Grid, Stack, Text, UnstyledButton, createStyles } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { IconDeviceDesktop, IconDeviceMobile, TablerIconsProps } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { LayoutKind } from '~/server/db/items';
import { isMobileUserAgent } from '~/validations/mobile';

import { useStyles } from '../SelectElement/Shared/styles';
import { LayoutForm } from './Form/LayoutForm';
import { DesktopLayoutPreview } from './Form/Preview/DesktopPreview';
import { MobileLayoutPreview } from './Form/Preview/MobilePreview';

export const CreateLayoutModal = ({
  id,
  context,
  innerProps,
}: ContextModalProps<{ boardId: string }>) => {
  const currentKind = isMobileUserAgent(navigator.userAgent) ? 'mobile' : 'desktop';
  const [kind, setKind] = useState<LayoutKind>();

  if (kind === 'mobile') {
    return (
      <LayoutForm
        kind="mobile"
        columns={{ min: 1, default: 3, max: 9 }}
        preview={MobileLayoutPreview}
        onClose={() => context.closeModal(id)}
        {...innerProps}
      />
    );
  }

  if (kind === 'desktop') {
    return (
      <LayoutForm
        kind="desktop"
        columns={{ min: 7, default: 11, max: 23 }}
        preview={DesktopLayoutPreview}
        onClose={() => context.closeModal(id)}
        {...innerProps}
      />
    );
  }

  return (
    <Grid>
      <Grid.Col span={12} md={6}>
        <KindItem
          isCurrent={currentKind === 'desktop'}
          kind="desktop"
          onSelect={setKind}
          icon={IconDeviceDesktop}
        />
      </Grid.Col>
      <Grid.Col span={12} md={6}>
        <KindItem
          isCurrent={currentKind === 'mobile'}
          kind="mobile"
          onSelect={setKind}
          icon={IconDeviceMobile}
        />
      </Grid.Col>
    </Grid>
  );
};

interface KindItemProps {
  isCurrent?: boolean;
  kind: LayoutKind;
  onSelect: (kind: LayoutKind) => void;
  icon: (props: TablerIconsProps) => JSX.Element;
}

const KindItem = ({ isCurrent, kind, onSelect, icon: Icon }: KindItemProps) => {
  const { classes, cx } = useStyles();
  const { classes: additionalClasses } = useAditionalStyles();
  return (
    <UnstyledButton
      className={cx(
        classes.elementButton,
        classes.styledButton,
        isCurrent && additionalClasses.currentKind
      )}
      onClick={() => onSelect(kind)}
      py="md"
      pos="relative"
    >
      <Stack className={classes.elementStack} align="center" spacing={5}>
        <motion.div
          // On hover zoom in
          whileHover={{ scale: 1.2 }}
        >
          <Icon size={40} strokeWidth={1.5} />
        </motion.div>
        <Text className={classes.elementName} weight={500} size="sm">
          {kind} Layout
        </Text>
      </Stack>
    </UnstyledButton>
  );
};

const useAditionalStyles = createStyles((theme) => ({
  currentKind: {
    ':after': {
      content: '"Your device"',
      position: 'absolute',
      top: 0,
      right: 0,
      padding: '0.25rem',
      backgroundColor: 'red',
      borderTopRightRadius: theme.radius.sm,
      fontSize: '0.75rem',
    },
    border: '1px solid red',
  },
}));
