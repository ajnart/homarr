import { Card, Center, Text, UnstyledButton } from '@mantine/core';
import { NextLink } from '@mantine/next';
import { createStyles } from '@mantine/styles';
import { ServiceType } from '../../../../types/service';
import { useCardStyles } from '../../../layout/useCardStyles';
import { useEditModeStore } from '../../Views/useEditModeStore';
import { BaseTileProps } from '../type';
import { ServiceMenu } from './ServiceMenu';
import { ServicePing } from './ServicePing';

interface ServiceTileProps extends BaseTileProps {
  service: ServiceType;
}

export const ServiceTile = ({ className, service }: ServiceTileProps) => {
  const isEditMode = useEditModeStore((x) => x.enabled);

  const { cx, classes } = useStyles();

  const {
    classes: { card: cardClass },
  } = useCardStyles();

  const inner = (
    <>
      <Text align="center" weight={500} size="md" className={classes.serviceName}>
        {service.name}
      </Text>
      <Center style={{ height: '75%', flex: 1 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={classes.image} src={service.appearance.iconUrl} alt="" />
      </Center>
    </>
  );

  return (
    <Card className={cx(className, cardClass)} withBorder radius="lg" shadow="md">
      {/* TODO: add service menu */}

      <div style={{ position: 'absolute', top: 10, right: 10 }}>
        <ServiceMenu service={service} />
      </div>

      {!service.url || isEditMode ? (
        <UnstyledButton
          className={classes.button}
          style={{ pointerEvents: isEditMode ? 'none' : 'auto' }}
        >
          {inner}
        </UnstyledButton>
      ) : (
        <UnstyledButton
          style={{ pointerEvents: isEditMode ? 'none' : 'auto' }}
          component={NextLink}
          href={service.url}
          target={service.behaviour.isOpeningNewTab ? '_blank' : '_self'}
          className={cx(classes.button, classes.link)}
        >
          {inner}
        </UnstyledButton>
      )}
      <ServicePing service={service} />
    </Card>
  );
};

const useStyles = createStyles((theme, _params, getRef) => ({
  image: {
    ref: getRef('image'),
    maxHeight: '80%',
    maxWidth: '80%',
    transition: 'transform 100ms ease-in-out',
  },
  serviceName: {
    ref: getRef('serviceName'),
  },
  button: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  link: {
    [`&:hover .${getRef('image')}`]: {
      // TODO: add styles for image when hovering card
    },
    [`&:hover .${getRef('serviceName')}`]: {
      // TODO: add styles for service name when hovering card
    },
  },
}));
