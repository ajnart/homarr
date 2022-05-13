import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Text, AspectRatio, SimpleGrid, Card, Image, Group, Space } from '@mantine/core';
import { useConfig } from '../../tools/state';
import { serviceItem } from '../../tools/types';
import AddItemShelfItem from './AddAppShelfItem';
import { AppShelfItemWrapper } from './AppShelfItemWrapper';
import AppShelfMenu from './AppShelfMenu';

const AppShelf = () => {
  const { config } = useConfig();

  return (
    <SimpleGrid m="xl" cols={5} spacing="xl">
      {config.services.map((service) => (
        <AppShelfItem key={service.name} service={service} />
      ))}
      <AddItemShelfItem />
    </SimpleGrid>
  );
};

export function AppShelfItem(props: any) {
  const { service }: { service: serviceItem } = props;
  const [hovering, setHovering] = useState(false);
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
      <AppShelfItemWrapper hovering={hovering}>
        <Card.Section>
          <Group position="apart" mx="lg">
            <Space />
            <Text
              // TODO: #1 Remove this hack to get the text to be centered.
              ml={15}
              style={{
                alignSelf: 'center',
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                justifyItems: 'center',
              }}
              mt="sm"
              weight={500}
            >
              {service.name}
            </Text>
            <motion.div
              style={{
                alignSelf: 'flex-end',
              }}
              animate={{
                opacity: hovering ? 1 : 0,
              }}
            >
              <AppShelfMenu service={service} />
            </motion.div>
          </Group>
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
      </AppShelfItemWrapper>
    </motion.div>
  );
}

export default AppShelf;
