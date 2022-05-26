import React, { useEffect } from 'react';
import { createStyles, Footer as FooterComponent } from '@mantine/core';
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
  useEffect(() => {
    // Fetch Data here when component first mounted
    fetch(`https://api.github.com/repos/${REPO_URL}/releases/latest`).then((res) => {
      res.json().then((data) => {
        if (data.tag_name !== CURRENT_VERSION) {
          showNotification({
            color: 'yellow',
            autoClose: false,
            title: 'New version available',
            message: `Version ${data.tag_name} is available, update now! 😡`,
          });
        }
      });
    });
  }, []);

  return (
    <FooterComponent
      height="auto"
      style={{
        background: 'none',
        border: 'none',
        clear: 'both',
      }}
      children={undefined}
    />
  );
}
