import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Anchor,
  AspectRatio,
  Card,
  Center,
  createStyles,
  Image,
  Text,
  useMantineColorScheme,
} from '@mantine/core';
import { motion } from 'framer-motion';
import { useState } from 'react';
import PingComponent from '../../modules/ping/PingModule';
import { useConfig } from '../../tools/state';
import { serviceItem } from '../../tools/types';
import AppShelfMenu from './AppShelfMenu';

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

export function SortableItem(props: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: props.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {props.children}
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
          // Use the grab cursor when hovering over the card
          cursor: hovering ? 'grab' : 'auto',
          background: `rgba(${colorScheme === 'dark' ? '37, 38, 43,' : '255, 255, 255,'} \
          ${(config.settings.appOpacity || 100) / 100}`,
          borderColor: `rgba(${colorScheme === 'dark' ? '37, 38, 43,' : '233, 236, 239,'} \
          ${(config.settings.appOpacity || 100) / 100}`,
        }}
      >
        <Card.Section>
          <Anchor
            target={service.newTab === false ? '_top' : '_blank'}
            href={service.openedUrl ? service.openedUrl : service.url}
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
        <Card.Section>
          <Center>
            <AspectRatio
              ratio={3 / 5}
              m="lg"
              style={{
                height: 75 * ((config.settings.appCardWidth ?? 1) * 1.2),
                width: 75 * ((config.settings.appCardWidth ?? 1) * 2),
              }}
            >
              <motion.i
                whileHover={{
                  scale: 1.1,
                }}
              >
                <Anchor
                  href={service.openedUrl ?? service.url}
                  target={service.newTab === false ? '_top' : '_blank'}
                >
                  <Image
                    styles={{ root: { cursor: 'pointer' } }}
                    width={75 * ((config.settings.appCardWidth ?? 1) * 1.2)}
                    height={75 * ((config.settings.appCardWidth ?? 1) * 1.2)}
                    src={service.icon}
                    fit="contain"
                  />
                </Anchor>
              </motion.i>
            </AspectRatio>
            {service.ping !== false && <PingComponent url={service.url} status={service.status} />}
          </Center>
        </Card.Section>
      </Card>
    </motion.div>
  );
}
