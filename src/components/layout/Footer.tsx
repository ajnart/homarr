import React, { useEffect, useState } from 'react';
import {
  createStyles,
  Anchor,
  Text,
  Group,
  ActionIcon,
  Footer as FooterComponent,
  useMantineTheme,
} from '@mantine/core';
import { BrandGithub } from 'tabler-icons-react';
import { showNotification } from '@mantine/notifications';
import { CURRENT_VERSION, REPO_URL } from '../../../data/constants';

const useStyles = createStyles((theme) => ({
  footer: {
    borderTop: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
  },

  inner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${theme.spacing.md}px ${theme.spacing.md}px`,

    [theme.fn.smallerThan('sm')]: {
      flexDirection: 'column',
    },
  },

  links: {
    [theme.fn.smallerThan('sm')]: {
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
  },
}));

interface FooterCenteredProps {
  links: { link: string; label: string }[];
}

export function Footer({ links }: FooterCenteredProps) {
  const [update, setUpdate] = useState(false);
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const items = links.map((link) => (
    <Anchor<'a'>
      color="dimmed"
      key={link.label}
      href={link.link}
      sx={{ lineHeight: 1 }}
      onClick={(event) => event.preventDefault()}
      size="sm"
    >
      {link.label}
    </Anchor>
  ));

  const [latestVersion, setLatestVersion] = useState('0');
  const [isOpen, setOpen] = useState(true);
  useEffect(() => {
    // Fetch Data here when component first mounted
    fetch(`https://api.github.com/repos/${REPO_URL}/releases/latest`).then((res) => {
      res.json().then((data) => {
        setLatestVersion(data.tag_name);
        if (data.tag_name !== CURRENT_VERSION) {
          setUpdate(true);
        }
      });
    });
  }, []);
  if (update) {
    showNotification({
      color: 'yellow',
      autoClose: false,
      title: 'New version available',
      message: `Version ${latestVersion} is available, update now! 😡`,
    });
  }

  return (
    <FooterComponent
      p={5}
      height="auto"
      style={{
        position: 'relative',
        background: 'none',
        border: 'none',
        clear: 'both',
      }}
    >
      <Group position="right" direction="row" align="center" mr="xs">
        <Group spacing={0}>
          <ActionIcon<'a'> component="a" href="https://github.com/ajnart/homarr" size="lg">
            <BrandGithub size={18} />
          </ActionIcon>
          <Text
            style={{
              position: 'relative',
              fontSize: '0.90rem',
              color: 'gray',
            }}
          >
            {CURRENT_VERSION}
          </Text>
        </Group>
        <Text
          style={{
            fontSize: '0.90rem',
            textAlign: 'center',
            color: '#a0aec0',
          }}
        >
          Made with ❤️ by @
          <Anchor
            href="https://github.com/ajnart"
            style={{ color: 'inherit', fontStyle: 'inherit', fontSize: 'inherit' }}
          >
            ajnart
          </Anchor>
        </Text>
      </Group>
    </FooterComponent>
  );
}
