import { Center, Container, Stack, Text, Title, createStyles } from '@mantine/core';
import { IconBrowser, IconUnlink } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';

import { defineWidget } from '../helper';
import { IWidget } from '../widgets';

const definition = defineWidget({
  id: 'iframe',
  icon: IconBrowser,
  gridstack: {
    maxHeight: 12,
    maxWidth: 12,
    minHeight: 1,
    minWidth: 1,
  },
  options: {
    embedUrl: {
      type: 'text',
      defaultValue: '',
    },
    allowFullScreen: {
      type: 'switch',
      defaultValue: false,
    },
  },
  component: IFrameTile,
});

export type IIFrameWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface IFrameTileProps {
  widget: IIFrameWidget;
}

function IFrameTile({ widget }: IFrameTileProps) {
  const { t } = useTranslation('modules/iframe');
  const { classes } = useStyles();

  if (!widget.properties.embedUrl) {
    return (
      <Center h="100%">
        <Stack align="center">
          <IconUnlink size={36} strokeWidth={1.2} />
          <Stack align="center" spacing={0}>
            <Title order={6} align="center">
              {t('card.errors.noUrl.title')}
            </Title>
            <Text align="center" maw={200}>
              {t('card.errors.noUrl.text')}
            </Text>
          </Stack>
        </Stack>
      </Center>
    );
  }

  return (
    <Container h="100%" w="100%" p={0}>
      <iframe
        className={classes.iframe}
        src={widget.properties.embedUrl}
        title="widget iframe"
        allowFullScreen={widget.properties.allowFullScreen}
      >
        <Text>Your Browser does not support iframes. Please update your browser.</Text>
      </iframe>
    </Container>
  );
}

const useStyles = createStyles(({ radius }) => ({
  iframe: {
    borderRadius: radius.sm,
    width: '100%',
    height: '100%',
    border: 'none',
    background: 'none',
    backgroundColor: 'transparent',
  },
}));

export default definition;
