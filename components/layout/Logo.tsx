import { Text } from '@mantine/core';
import * as React from 'react';

export function Logo({ style }: any) {
	return (
		<Text sx={style} weight="bold" variant="gradient" gradient={{ from: 'red', to: 'orange', deg: 145 }}>
			Homarr
		</Text>
	);
}
