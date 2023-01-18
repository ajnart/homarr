import { openContextModal } from '@mantine/modals';
import { OpenContextModal } from '@mantine/modals/lib/context';

export const openContextModalGeneric = <T extends Record<string, unknown>>(
  payload: OpenContextModal<T> & { modal: string }
) => openContextModal(payload);
