import { Grid, Text } from '@mantine/core';
import {
  IconArrowsUpDown,
  IconCalendarTime,
  IconClock,
  IconCloudRain,
  IconFileDownload,
} from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { GenericAvailableElementType } from '../Shared/GenericElementType';
import { SelectorBackArrow } from '../Shared/SelectorBackArrow';

interface AvailableIntegrationElementsProps {
  onClickBack: () => void;
}

export const AvailableIntegrationElements = ({
  onClickBack,
}: AvailableIntegrationElementsProps) => {
  const { t } = useTranslation('layout/element-selector/selector');
  return (
    <>
      <SelectorBackArrow onClickBack={onClickBack} />

      <Text mb="md" color="dimmed">
        Integrations interact with your services, to provide you with more control over your
        applications. They usually require a few configurations before use.
      </Text>

      <Grid>
        <GenericAvailableElementType
          name="Usenet downloads"
          description="Display and manage your Usenet downloads directly from Homarr"
          image={<IconFileDownload />}
        />
        <GenericAvailableElementType
          name="BitTorrent downloads"
          description="Display and manage your Torrent downloads directly from Homarr"
          image={<IconFileDownload />}
        />
        <GenericAvailableElementType
          name="Calendar"
          description="Integrate your Sonarr, Radarr, Lidarr and Readarr releases in a calendar"
          image={<IconCalendarTime />}
        />
        <GenericAvailableElementType
          name="Date & Time"
          description="Display the current date & time"
          image={<IconClock />}
        />
        <GenericAvailableElementType
          name="Weather"
          description="Display the current weather of a specified location"
          image={<IconCloudRain />}
        />
        <GenericAvailableElementType
          name="Dash."
          description="Display hardware data in realtime on your dashboard"
          image="https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/dashdot.png"
        />
        <GenericAvailableElementType
          name="Torrrent network traffic"
          description="Display the current download & upload of your torrent clients"
          image={<IconArrowsUpDown />}
        />
      </Grid>
    </>
  );
};
