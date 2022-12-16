import { Button, Text } from '@mantine/core';
import { IconArrowNarrowLeft } from '@tabler/icons';

interface SelectorBackArrowProps {
  onClickBack: () => void;
}

export const SelectorBackArrow = ({ onClickBack }: SelectorBackArrowProps) => (
  <Button
    leftIcon={<IconArrowNarrowLeft />}
    onClick={onClickBack}
    styles={{ inner: { width: 'fit-content' } }}
    fullWidth
    variant="default"
    mb="md"
  >
    <Text>See all available elements</Text>
  </Button>
);
