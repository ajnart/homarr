import { Text } from '@mantine/core';

interface FilenameProps {
  filename: string;
}

export function Filename(props: FilenameProps) {
  const { filename } = props;

  return (
    <Text
      style={{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
      size="xs"
    >
      {filename.substring(filename.lastIndexOf('/') + 1)}
    </Text>
  );
}
