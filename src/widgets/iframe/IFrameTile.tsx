import { Center, Container, Stack, Text, Title, createStyles } from '@mantine/core';
import { IconBrowser, IconUnlink } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';

import { defineWidget } from '../helper';
import { IWidget } from '../widgets';

function sanitizeUrl(url: string) {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch (e) {
    return 'about:blank';
  }
  if (['http:', 'https:'].includes(parsedUrl.protocol)) {
    return parsedUrl.href;
  } else {
    throw new Error(`Protocol '${parsedUrl.protocol}' is not supported. Use HTTP or HTTPS.`);
  }
}

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
    allowScrolling: {
      type: 'switch',
      defaultValue: true,
    },
    allowTransparency: {
      type: 'switch',
      defaultValue: false,
    },
    allowPayment: {
      type: 'switch',
      defaultValue: false,
    },
    allowAutoPlay: {
      type: 'switch',
      defaultValue: false,
    },
    allowMicrophone: {
      type: 'switch',
      defaultValue: false,
    },
    allowCamera: {
      type: 'switch',
      defaultValue: false,
    },
    allowGeolocation: {
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

  const allowedPermissions: string[] = [];

  if (widget.properties.allowTransparency) {
    allowedPermissions.push('transparency');
  }

  if (widget.properties.allowFullScreen) {
    allowedPermissions.push('fullscreen');
  }

  if (widget.properties.allowPayment) {
    allowedPermissions.push('payment');
  }

  if (widget.properties.allowAutoPlay) {
    allowedPermissions.push('autoplay');
  }

  if (widget.properties.allowCamera) {
    allowedPermissions.push('camera');
  }

  if (widget.properties.allowMicrophone) {
    allowedPermissions.push('microphone');
  }

  if (widget.properties.allowGeolocation) {
    allowedPermissions.push('geolocation');
  }

  return (
    <Container h="100%" w="100%" maw="initial" mah="initial" p={0}>
      <iframe
        className={classes.iframe}
        src={sanitizeUrl(widget.properties.embedUrl)}
        title="widget iframe"
        allow={allowedPermissions.join(' ')}
      >
        <Text>{t('card.errors.browserSupport')}</Text>
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
