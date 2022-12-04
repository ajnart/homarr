import { Button, Stack, Text } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons';
import Image from 'next/image';
import React, { ReactNode } from 'react';
import { useStyles } from './styles';

interface GenericAvailableElementTypeProps {
  name: string;
  description?: string;
  image: string | ReactNode;
  disabled?: boolean;
}

export const GenericAvailableElementType = ({
  name,
  description,
  image,
  disabled,
}: GenericAvailableElementTypeProps) => {
  const { classes } = useStyles();

  const Icon = () => {
    if (React.isValidElement(image)) {
      return <>{image}</>;
    }

    return <Image src={image as string} width={24} height={24} />;
  };

  return (
    <Button
      className={classes.styledButton}
      leftIcon={<Icon />}
      rightIcon={<IconChevronRight opacity={0.5} />}
      styles={{
        root: {
          height: 'auto',
          padding: '8px 12px',
        },
        inner: {
          justifyContent: 'left',
        },
        label: {
          justifyContent: 'space-between',
          width: '100%',
        },
      }}
      disabled={disabled}
      fullWidth
    >
      <Stack spacing={0}>
        <Text className={classes.elementText}>{name}</Text>
        {description && (
          <Text className={classes.elementText} size="xs" color="dimmed">
            {description}
          </Text>
        )}
      </Stack>
    </Button>
  );
};
