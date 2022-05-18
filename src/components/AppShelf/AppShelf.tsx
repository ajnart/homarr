import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Text, AspectRatio, Card, Image, Center, Grid, createStyles } from '@mantine/core';
import { useConfig } from '../../tools/state';
import { serviceItem } from '../../tools/types';
import AppShelfMenu from './AppShelfMenu';
import PingComponent from '../modules/ping/PingModule';

const useStyles = createStyles((theme) => ({
  item: {
    transition: 'box-shadow 150ms ease, transform 100ms ease',

    '&:hover': {
      boxShadow: `${theme.shadows.md} !important`,
      transform: 'scale(1.05)',
    },
  },
}));

const AppShelf = (props: any) => {
  const { config } = useConfig();
  return (
    <Grid gutter="xl" align="center">
      {config.services.map((service) => (
        <Grid.Col key={service.name} span={6} xl={2} xs={4} sm={3} md={3}>
          <AppShelfItem key={service.name} service={service} />
        </Grid.Col>
      ))}
    </Grid>
  );
};

export function AppShelfItem(props: any) {
  const { service }: { service: serviceItem } = props;
  const [hovering, setHovering] = useState(false);
  const { classes, theme } = useStyles();
  return (
    <motion.div
      key={service.name}
      onHoverStart={() => {
        setHovering(true);
      }}
      onHoverEnd={() => {
        setHovering(false);
      }}
    >
      <Card withBorder radius="lg" shadow="md" className={classes.item}>
        <Card.Section>
          <Text mt="sm" align="center" lineClamp={1} weight={550}>
            {service.name}
          </Text>
          <motion.div
            style={{
              position: 'absolute',
              top: 15,
              right: 15,
              alignSelf: 'flex-end',
            }}
            animate={{
              opacity: hovering ? 1 : 0,
            }}
          >
            <AppShelfMenu service={service} />
          </motion.div>
        </Card.Section>
        <Center>
          <Card.Section>
            <AspectRatio
              ratio={3 / 5}
              m="xl"
              style={{
                width: 150,
                height: 90,
              }}
            >
              <motion.i
                whileHover={{
                  cursor: 'pointer',
                  scale: 1.1,
                }}
              >
                <Image
                  width={80}
                  height={80}
                  src={service.icon}
                  fit="contain"
                  onClick={() => {
                    window.open(service.url);
                  }}
                />
              </motion.i>
            </AspectRatio>
            <PingComponent url={service.url} />
          </Card.Section>
        </Center>
      </Card>
    </motion.div>
  );
}

export default AppShelf;
