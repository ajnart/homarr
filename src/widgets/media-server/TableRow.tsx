import { Avatar, Flex, Popover, Text, createStyles } from '@mantine/core';
import { AppAvatar } from '~/components/AppAvatar';
import { GenericSessionInfo } from '~/types/api/media-server/session-info';
import { AppType } from '~/types/app';

import { DetailCollapseable } from './DetailCollapseable';
import { NowPlayingDisplay } from './NowPlayingDisplay';

interface TableRowProps {
  session: GenericSessionInfo;
  app: AppType | undefined;
}

export const TableRow = ({ session, app }: TableRowProps) => {
  const hasUserThumb = session.userProfilePicture !== undefined;
  const { classes } = useStyles();
  return (
    <Popover
      withArrow
      withinPortal
      radius="lg"
      shadow="sm"
      transitionProps={{
        transition: 'pop',
      }}
    >
      <Popover.Target>
        <tr className={classes.dataRow}>
          <td>
            <Flex wrap="nowrap" gap="xs">
              {app?.appearance.iconUrl && <AppAvatar iconUrl={app.appearance.iconUrl} />}
              <Text lineClamp={1}>{session.sessionName}</Text>
            </Flex>
          </td>
          <td>
            <Flex wrap="nowrap" gap="sm">
              {hasUserThumb ? (
                <Avatar src={session.userProfilePicture} size="sm" />
              ) : (
                <Avatar src={null} alt={session.username} size="sm">
                  {session.username?.at(0)?.toUpperCase()}
                </Avatar>
              )}
              <Text style={{ whiteSpace: 'nowrap' }}>{session.username}</Text>
            </Flex>
          </td>
          <td>
            <NowPlayingDisplay session={session} />
          </td>
        </tr>
      </Popover.Target>
      <Popover.Dropdown>
        <DetailCollapseable session={session} />
      </Popover.Dropdown>
    </Popover>
  );
};

const useStyles = createStyles(() => ({
  dataRow: {
    cursor: 'pointer',
  },
}));
