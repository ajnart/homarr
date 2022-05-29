import { Group, Title } from '@mantine/core';
import OverseerrMediaDisplay, {
  OverseerrMedia,
} from '../components/modules/overseerr/OverseerrMediaDisplay';
import media from '../components/modules/overseerr/example.json';
import { ModuleWrapper } from '../components/modules/moduleWrapper';
import { SearchModule } from '../components/modules';

export default function TryOverseerr() {
  return (
    <Group direction="column">
      <OverseerrMediaDisplay media={media} />
      <ModuleWrapper module={SearchModule} />
    </Group>
  );
}
