import React from 'react';
import { createStyles, Anchor, Text, Group, ActionIcon } from '@mantine/core';
import { BrandGithub, Phone, BrandGmail } from 'tabler-icons-react';
import { posix } from 'path';

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
    <Group
      sx={{
        position: 'fixed',
        bottom: 0,
        right: 15,
      }}
      direction="row"
      align="center"
      mb={15}
    >
      <Group className={classes.links}>{items}</Group>
      <Group spacing="xs" position="right" noWrap>
        <ActionIcon<'a'> component="a" href="https://github.com/ajnart/myhomepage" size="lg">
          <BrandGithub size={18} />
        </ActionIcon>
      </Group>
      <Text
        style={{
          fontSize: '0.75rem',
          textAlign: 'center',
          color: '#a0aec0',
        }}
      >
        Made with ❤️ by @
        <Anchor href="https://github.com/ajnart" style={{ color: 'inherit', fontStyle: 'inherit' }}>
          ajnart
        </Anchor>
      </Text>
    </Group>
  );
}
