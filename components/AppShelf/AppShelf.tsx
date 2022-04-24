import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ActionIcon,
  createStyles,
  Grid,
  Group,
  Text,
  Title,
  Paper,
  Tooltip,
  Image,
  ThemeIcon,
  useMantineTheme,
  Anchor,
  Box,
  Menu,
  AspectRatio,
} from '@mantine/core';
import { ArrowBack, Trash } from 'tabler-icons-react';

const AppShelf = () => {
  const Services = loadServices();
  const [hovering, setHovering] = useState('none');
  const theme = useMantineTheme();
  return (
    <Grid m={'xl'} gutter={'xl'}>
      {Services.map((service, i) => (
        <Grid.Col span={4} lg={2} sm={3} key={i}>
          <motion.div
            onHoverStart={(e) => {
              setHovering(service.name);
            }}
            onHoverEnd={(e) => {
              setHovering('none');
            }}
          >
            <AspectRatio ratio={4 / 3}>
              <Box
                sx={(theme) => ({
                  backgroundColor:
                    theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
                  textAlign: 'center',
                  padding: theme.spacing.xl,
                  borderRadius: theme.radius.md,

                  '&:hover': {
                    backgroundColor:
                      theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
                  },
                })}
              >
                <motion.div animate={{opacity: hovering == service.name ? 1 : 0}}>
                  <Menu sx={{ position: 'absolute', top: 3, right: 3 }}>
                    <Menu.Label>Settings</Menu.Label>

                    <Menu.Label>Danger zone</Menu.Label>
                    <Menu.Item color="red" icon={<Trash size={14} />}>
                      Delete
                    </Menu.Item>
                  </Menu>
                </motion.div>
                <Group position="center">
                  <Anchor href={service.url} target="_blank">
                    <motion.div whileHover={{ scale: 1.2 }}>
                      <Image height={60} src={service.icon} alt={service.name} />
                    </motion.div>
                  </Anchor>
                  <Text>{service.name}</Text>
                </Group>
              </Box>
            </AspectRatio>
          </motion.div>
        </Grid.Col>
      ))}
    </Grid>
  );
};

export default AppShelf;
function loadServices() {
  return [
    {
      name: 'Radarr',
      icon: 'https://cdn.jsdelivr.net/gh/IceWhaleTech/CasaOS-AppStore@main/Apps/Radarr/icon.png',
      url: 'http://server:7878/',
    },
    {
      name: 'Sonarr',
      icon: 'https://cdn.jsdelivr.net/gh/IceWhaleTech/CasaOS-AppStore@main/Apps/Sonarr/icon.png',
      url: 'http://server:8989/',
    },
    {
      name: 'Sonarr',
      icon: 'https://cdn.jsdelivr.net/gh/IceWhaleTech/CasaOS-AppStore@main/Apps/Sonarr/icon.png',
      url: 'http://server:8989/',
    },
    {
      name: 'Sonarr',
      icon: 'https://cdn.jsdelivr.net/gh/IceWhaleTech/CasaOS-AppStore@main/Apps/Sonarr/icon.png',
      url: 'http://server:8989/',
    },
    {
      name: 'Sonarr',
      icon: 'https://cdn.jsdelivr.net/gh/IceWhaleTech/CasaOS-AppStore@main/Apps/Sonarr/icon.png',
      url: 'http://server:8989/',
    },
    {
      name: 'Sonarr',
      icon: 'https://cdn.jsdelivr.net/gh/IceWhaleTech/CasaOS-AppStore@main/Apps/Sonarr/icon.png',
      url: 'http://server:8989/',
    },
    {
      name: 'Sonarr',
      icon: 'https://cdn.jsdelivr.net/gh/IceWhaleTech/CasaOS-AppStore@main/Apps/Sonarr/icon.png',
      url: 'http://server:8989/',
    },
    {
      name: 'Sonarr',
      icon: 'https://cdn.jsdelivr.net/gh/IceWhaleTech/CasaOS-AppStore@main/Apps/Sonarr/icon.png',
      url: 'http://server:8989/',
    },
    {
      name: 'Sonarr',
      icon: 'https://cdn.jsdelivr.net/gh/IceWhaleTech/CasaOS-AppStore@main/Apps/Sonarr/icon.png',
      url: 'http://server:8989/',
    },
    {
      name: 'Sonarr',
      icon: 'https://cdn.jsdelivr.net/gh/IceWhaleTech/CasaOS-AppStore@main/Apps/Sonarr/icon.png',
      url: 'http://server:8989/',
    },
  ];
}
