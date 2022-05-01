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
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { AlertCircle, Cross, X } from 'tabler-icons-react';
import AppShelfMenu from './AppShelfMenu';
import AddItemShelfItem from './AddAppShelfItem';
import { useServices } from '../../tools/state';
import { pingQbittorrent } from '../../tools/api';

const useStyles = createStyles((theme) => ({
  main: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
    textAlign: 'center',
    padding: theme.spacing.xl,
    borderRadius: theme.radius.md,

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2],
    },
  },
}));

const AppShelf = (props: any) => {
  const { services, addService, removeService, setServicesState } = useServices();
  const { classes } = useStyles();
  const [hovering, setHovering] = useState('none');

  useEffect(() => {
    const localServices = localStorage.getItem('services');
    if (localServices) {
      setServicesState(JSON.parse(localServices));
    }
  }, []);
  services.forEach((service) => {
    if (service.type === 'qBittorrent') {
      pingQbittorrent(service);
    }
  });

  return (
    <Grid m="xl" gutter="xl">
      {services.map((service, i) => (
        <Grid.Col lg={2} sm={3} key={i}>
          <motion.div
            onHoverStart={(e) => {
              setHovering(service.name);
            }}
            onHoverEnd={(e) => {
              setHovering('none');
            }}
          >
            <AspectRatio ratio={4 / 3}>
              <Box className={classes.main}>
                <motion.div animate={{ opacity: hovering == service.name ? 1 : 0 }}>
                  <AppShelfMenu removeitem={removeService} name={service.name} />
                </motion.div>
                <Group direction="column" position="center">
                  <Anchor href={service.url} target="_blank">
                    <motion.div whileHover={{ scale: 1.2 }}>
                      <Image style={{ maxWidth: 60 }} src={service.icon} alt={service.name} />
                    </motion.div>
                  </Anchor>
                  <Text>{service.name}</Text>
                </Group>
              </Box>
            </AspectRatio>
          </motion.div>
        </Grid.Col>
      ))}
      <AddItemShelfItem additem={addService} />
    </Grid>
  );
};

export default AppShelf;
