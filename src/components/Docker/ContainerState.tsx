import { Badge, BadgeVariant, MantineSize } from '@mantine/core';
import Dockerode from 'dockerode';

export interface ContainerStateProps {
  state: Dockerode.ContainerInfo['State'];
}

export default function ContainerState(props: ContainerStateProps) {
  const { state } = props;
  const options: {
    size: MantineSize;
    radius: MantineSize;
    variant: BadgeVariant;
  } = {
    size: 'md',
    radius: 'md',
    variant: 'outline',
  };
  switch (state) {
    case 'running': {
      return (
        <Badge color="green" {...options}>
          Running
        </Badge>
      );
    }
    case 'created': {
      return (
        <Badge color="cyan" {...options}>
          Created
        </Badge>
      );
    }
    case 'exited': {
      return (
        <Badge color="red" {...options}>
          Stopped
        </Badge>
      );
    }
    default: {
      return (
        <Badge color="purple" {...options}>
          Unknown
        </Badge>
      );
    }
  }
}
