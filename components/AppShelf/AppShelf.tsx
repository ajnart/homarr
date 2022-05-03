import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Grid,
  Group,
  Text,
  Image,
  Anchor,
  Box,
  AspectRatio,
  createStyles,
  Center,
  Container,
  SimpleGrid,
  Space,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { AlertCircle, Cross, X } from 'tabler-icons-react';
import AppShelfMenu from './AppShelfMenu';
import AddItemShelfItem from './AddAppShelfItem';
import { useConfig } from '../../tools/state';
import { pingQbittorrent } from '../../tools/api';
import { Config } from '../../tools/types';

const useStyles = createStyles((theme) => ({
  main: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
    textAlign: 'center',
    padding: theme.spacing.xl,
    borderRadius: theme.radius.sm,
    width: 200,
    height: 180,

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2],
    },
  },
}));

const AppShelf = (props: any) => {
  const { config, addService, removeService, setConfig } = useConfig();
  const { classes } = useStyles();
  const [hovering, setHovering] = useState('none');

  /* A hook that is used to load the config from local storage. */
  useEffect(() => {
    const localConfig = localStorage.getItem('config');
    if (localConfig) {
      setConfig(JSON.parse(localConfig));
    }
  }, []);
  if (config.services && config.services.length === 0) {
    config.services.forEach((service) => {
      if (service.type === 'qBittorrent') {
        pingQbittorrent(service);
      }
    });
  }

  return (
    <SimpleGrid m="xl" cols={4} spacing="xl">
      {config.services.map((service, i) => (
        <motion.div
          onHoverStart={(e) => {
            setHovering(service.name);
          }}
          onHoverEnd={(e) => {
            setHovering('none');
          }}
        >
          <Box className={classes.main}>
            <Group position="center">
              <Space />
              <Text>{service.name}</Text>
              <motion.div animate={{ opacity: hovering == service.name ? 1 : 0 }}>
                <AppShelfMenu removeitem={removeService} name={service.name} />
              </motion.div>
            </Group>
            <Group direction="column" position="center">
              <Anchor href={service.url} target="_blank">
                <motion.div whileHover={{ scale: 1.2 }}>
                  <Image
                    style={{
                      maxWidth: 100,
                    }}
                    fit="cover"
                    src={service.icon}
                    alt={service.name}
                  />
                </motion.div>
              </Anchor>
            </Group>
          </Box>
        </motion.div>
      ))}
      <AddItemShelfItem/>
    </SimpleGrid>
  );
};

export default AppShelf;
