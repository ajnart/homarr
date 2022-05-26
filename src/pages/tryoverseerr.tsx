import { Group, Title } from '@mantine/core';
import OverseerrMediaDisplay, {
  OverseerrMedia,
} from '../components/modules/overseerr/OverseerrMediaDisplay';
import media from '../components/modules/overseerr/example.json';

export default function TryOverseerr() {
  return (
    <Group direction="column">
      <OverseerrMediaDisplay media={media} />
    </Group>
  );
}
