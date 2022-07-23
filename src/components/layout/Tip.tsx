import { Text } from '@mantine/core';

interface TipProps {
  children: React.ReactNode;
}

export default function Tip(props: TipProps) {
  return (
    <Text
      style={{
        fontSize: '0.75rem',
        color: 'gray',
        marginBottom: '0.5rem',
      }}
    >
      Tip: {props.children}
    </Text>
  );
}
