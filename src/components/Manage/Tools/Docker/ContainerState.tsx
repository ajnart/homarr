import { Badge, BadgeProps, MantineSize } from '@mantine/core';
import Dockerode from 'dockerode';
import { useTranslation } from 'next-i18next';

export interface ContainerStateProps {
  state: Dockerode.ContainerInfo['State'];
}

export default function ContainerState(props: ContainerStateProps) {
  const { state } = props;

  const { t } = useTranslation('modules/docker');

  const options: {
    size: MantineSize;
    radius: MantineSize;
    variant: BadgeProps['variant'];
  } = {
    size: 'md',
    radius: 'md',
    variant: 'outline',
  };
  switch (state) {
    case 'running': {
      return (
        <Badge color="green" {...options}>
          {t('table.states.running')}
        </Badge>
      );
    }
    case 'created': {
      return (
        <Badge color="cyan" {...options}>
          {t('table.states.created')}
        </Badge>
      );
    }
    case 'exited': {
      return (
        <Badge color="red" {...options}>
          {t('table.states.stopped')}
        </Badge>
      );
    }
    default: {
      return (
        <Badge color="purple" {...options}>
          {t('table.states.unknown')}
        </Badge>
      );
    }
  }
}
