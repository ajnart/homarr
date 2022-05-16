import React from 'react';
import {
  createStyles,
  Anchor,
  Text,
  Group,
  ActionIcon,
  Footer as FooterComponent,
} from '@mantine/core';
import { BrandGithub } from 'tabler-icons-react';
import { CURRENT_VERSION } from '../../../data/constants';

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

  return (
    <FooterComponent
      p={5}
      height="auto"
      style={{ border: 'none', position: 'fixed', bottom: 0, right: 0 }}
    >
      <Group position="right" mr="xs" mb="xs">
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
