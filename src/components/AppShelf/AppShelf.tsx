import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Text, AspectRatio, SimpleGrid, Card, Image, useMantineTheme } from '@mantine/core';
import { useConfig } from '../../tools/state';
import { serviceItem } from '../../tools/types';
import AppShelfMenu from './AppShelfMenu';

const AppShelf = () => {
  const { config } = useConfig();

  return (
    <SimpleGrid
      cols={7}
      spacing="xl"
      breakpoints={[
        { maxWidth: 2400, cols: 6, spacing: 'xl' },
        { maxWidth: 1800, cols: 5, spacing: 'xl' },
        { maxWidth: 1500, cols: 4, spacing: 'lg' },
        { maxWidth: 800, cols: 3, spacing: 'md' },
        { maxWidth: 400, cols: 3, spacing: 'sm' },
        { maxWidth: 400, cols: 2, spacing: 'sm' },
      ]}
    >
      {config.services.map((service) => (
        <AppShelfItem key={service.name} service={service} />
      ))}
    </SimpleGrid>
  );
};

export function AppShelfItem(props: any) {
  const { service }: { service: serviceItem } = props;
  const [hovering, setHovering] = useState(false);
  const theme = useMantineTheme();
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
      <Card
        style={{
          boxShadow: hovering ? '0px 0px 3px rgba(0, 0, 0, 0.5)' : '0px 0px 1px rgba(0, 0, 0, 0.5)',
          backgroundColor:
            theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[1],
        }}
        radius="md"
      >
        <Card.Section>
          <Text mt="sm" align="center" lineClamp={1} weight={500}>
            {service.name}
          </Text>
          <motion.div
            style={{
              position: 'absolute',
              top: 5,
              right: 5,
              alignSelf: 'flex-end',
            }}
            animate={{
              opacity: hovering ? 1 : 0,
            }}
          >
            <AppShelfMenu service={service} />
          </motion.div>
        </Card.Section>
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
                style={{
                  maxWidth: 80,
                }}
                fit="contain"
                onClick={() => {
                  window.open(service.url);
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
