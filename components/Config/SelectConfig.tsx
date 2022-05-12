import { Select } from '@mantine/core';
import { useState } from 'react';

export default function SelectConfig(props: any) {
  const [value, setValue] = useState<string | null>('');
  return (
    <Select
      value={value}
      onChange={setValue}
      data={[
        { value: 'default', label: 'Default' },
        { value: 'yourmom', label: 'Your mom' },
      ]}
    />
  );
}
