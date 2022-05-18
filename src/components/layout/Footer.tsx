import React, { useEffect, useState } from 'react';
import {
  createStyles,
  Anchor,
  Text,
  Group,
  ActionIcon,
  Footer as FooterComponent,
  Alert,
  useMantineTheme,
} from '@mantine/core';
import { AlertCircle, BrandGithub } from 'tabler-icons-react';
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

  const [latestVersion, setLatestVersion] = useState(CURRENT_VERSION);
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

  return (
    <FooterComponent
      p={5}
      height="auto"
      style={{
        background: 'none',
        border: 'none',
        clear: 'both',
        position: 'fixed',
        bottom: '0',
        left: '0',
      }}
    >
      <Group position="apart" direction="row" style={{ alignItems: 'end' }} mr="xs" mb="xs">
        <Group position="left">
          <Alert
            // onClick open latest release page
            onClose={() => setOpen(false)}
            icon={<AlertCircle size={16} />}
            title={`Updated version: ${latestVersion} is available. Current version: ${CURRENT_VERSION}`}
            withCloseButton
            radius="lg"
            hidden={CURRENT_VERSION === latestVersion || !isOpen}
            variant="outline"
            styles={{
              root: {
                backgroundColor:
                  theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[1],
              },

              closeButton: {
                marginLeft: '5px',
              },
            }}
            children={undefined}
          />
        </Group>
        <Group position="right">
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
      </Group>
    </FooterComponent>
  );
}
