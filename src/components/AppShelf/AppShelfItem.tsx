import {
  Text,
  Card,
  Anchor,
  AspectRatio,
  Image,
  Center,
  createStyles,
  useMantineColorScheme,
} from '@mantine/core';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { serviceItem } from '../../tools/types';
import PingComponent from '../modules/ping/PingModule';
import AppShelfMenu from './AppShelfMenu';
import { useConfig } from '../../tools/state';

const useStyles = createStyles((theme) => ({
  item: {
    transition: 'box-shadow 150ms ease, transform 100ms ease',

    '&:hover': {
      boxShadow: `${theme.shadows.md} !important`,
      transform: 'scale(1.05)',
    },
    [theme.fn.smallerThan('sm')]: {
      WebkitUserSelect: 'none',
    },
  },
}));

export function SortableAppShelfItem(props: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: props.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <AppShelfItem service={props.service} />
    </div>
  );
}

export function AppShelfItem(props: any) {
  const { service }: { service: serviceItem } = props;
  const [hovering, setHovering] = useState(false);
  const { config } = useConfig();
  const { colorScheme } = useMantineColorScheme();
  const { classes } = useStyles();
  return (
    <motion.div
      animate={{
        scale: [0.9, 1.06, 1],
        rotate: [0, 5, 0],
      }}
      transition={{ duration: 0.6, type: 'spring', damping: 10, mass: 0.75, stiffness: 100 }}
      key={service.name}
      onHoverStart={() => {
        setHovering(true);
      }}
      onHoverEnd={() => {
        setHovering(false);
      }}
    >
      <Card
        withBorder
        radius="lg"
        shadow="md"
        className={classes.item}
        style={{
          background: `rgba(${colorScheme === 'dark' ? '37, 38, 43,' : '255, 255, 255,'} \
          ${(config.settings.appOpacity || 100) / 100}`,
          borderColor: `rgba(${colorScheme === 'dark' ? '37, 38, 43,' : '233, 236, 239,'} \
          ${(config.settings.appOpacity || 100) / 100}`,
        }}
      >
        <Card.Section>
          <Anchor
            target="_blank"
            href={service.url}
            style={{ color: 'inherit', fontStyle: 'inherit', fontSize: 'inherit' }}
          >
            <Text mt="sm" align="center" lineClamp={1} weight={550}>
              {service.name}
            </Text>
          </Anchor>
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
                  scale: 1.1,
                }}
              >
                <Image
                  styles={{ root: { cursor: 'pointer' } }}
                  width={80}
                  height={80}
                  src={service.icon}
                  fit="contain"
                  onClick={() => {
                    if (service.openedUrl) window.open(service.openedUrl, '_blank');
                    else window.open(service.url);
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
