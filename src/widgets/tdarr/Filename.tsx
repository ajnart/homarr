import { Text } from '@mantine/core';

interface FilenameProps {
  filePath: string;
}

export function Filename(props: FilenameProps) {
  const { filePath } = props;

  return (
    <Text
      style={{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
      size="xs"
    >
      {filePath.split('\\').pop()?.split('/').pop() ?? filePath}
    </Text>
  );
}
