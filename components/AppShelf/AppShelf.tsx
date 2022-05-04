import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Grid,
  Group,
  Text,
  Anchor,
  Box,
  AspectRatio,
  createStyles,
  Center,
  Container,
  SimpleGrid,
  Space,
  Card,
  useMantineTheme,
  Image,
  Badge,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { AlertCircle, Cross, X } from 'tabler-icons-react';
import AppShelfMenu from './AppShelfMenu';
import AddItemShelfItem from './AddAppShelfItem';
import { useConfig } from '../../tools/state';
import { pingQbittorrent } from '../../tools/api';
import { Config, serviceItem } from '../../tools/types';
import { SettingsMenuButton } from '../Settings/SettingsMenu';

const useStyles = createStyles((theme) => ({
  main: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
    width: 200,
    height: 180,
  },
}));

const AppShelf = (props: any) => {
  const { config, addService, removeService, setConfig } = useConfig();

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
        <AppShelfItem service={service} />
      ))}
      <AddItemShelfItem />
    </SimpleGrid>
  );
};

export function AppShelfItem(props: any) {
  const { service }: { service: serviceItem } = props;
  const theme = useMantineTheme();
  const { removeService } = useConfig();
  const { classes } = useStyles();
  const [hovering, setHovering] = useState(false);
  return (
    <motion.div
      onHoverStart={(e) => {
        setHovering(true);
      }}
      onHoverEnd={(e) => {
        setHovering(false);
      }}
    >
      <Card
        className={classes.main}
        style={{
          boxShadow: hovering ? '0px 0px 3px rgba(0, 0, 0, 0.5)' : '0px 0px 1px rgba(0, 0, 0, 0.5)',
        }}
        radius={'md'}
      >
        <motion.div
          animate={{
            opacity: hovering ? 1 : 0,
          }}
        >
          <AppShelfMenu name={service.name} removeitem={removeService} />
        </motion.div>
        <Card.Section>
          <Center>
            <Text mt={'sm'} weight={500}>
              {service.name}
            </Text>
          </Center>
        </Card.Section>
        <Card.Section>
          <AspectRatio ratio={5 / 3} m="xl">
            <motion.i
              whileHover={{
                cursor: 'pointer',
                scale: 1.1,
              }}
            >
              <Image
                onClick={() => {
                  window.open(service.url);
                }}
                style={{
                  maxWidth: '50%',
                  marginBottom: 10,
                }}
                src={service.icon}
              />
            </motion.i>
          </AspectRatio>
        </Card.Section>
      </Card>
    </motion.div>
  );
}

export default AppShelf;
