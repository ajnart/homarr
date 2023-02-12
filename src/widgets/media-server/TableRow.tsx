import { Avatar, Collapse, createStyles, Flex, Group, Text } from '@mantine/core';
import { useState } from 'react';
import { AppAvatar } from '../../components/AppAvatar';
import { GenericSessionInfo } from '../../types/api/media-server/session-info';
import { AppType } from '../../types/app';
import { NowPlayingDisplay } from './NowPlayingDisplay';

interface TableRowProps {
  session: GenericSessionInfo;
  app: AppType | undefined;
}

export const TableRow = ({ session, app }: TableRowProps) => {
  const [collapseOpen, setCollapseOpen] = useState(false);
  const hasUserThumb = session.type === 'plex' && session.userThumb !== undefined;
  const { classes } = useStyles();
  return (
    <>
      <tr onClick={() => setCollapseOpen(!collapseOpen)}>
        <td>
          <Flex wrap="nowrap" gap="xs">
            {app?.appearance.iconUrl && <AppAvatar iconUrl={app.appearance.iconUrl} />}
            <Text lineClamp={1}>{session.sessionName}</Text>
          </Flex>
        </td>
        <td>
          <Flex wrap="nowrap" gap="sm">
            {hasUserThumb ? (
              <Avatar src={session.userThumb} size="sm" />
            ) : (
              <Avatar src={null} alt={session.username} size="sm">
                {session.username?.at(0)?.toUpperCase()}
              </Avatar>
            )}
            <Text>{session.username}</Text>
          </Flex>
        </td>
        <td>
          <NowPlayingDisplay session={session} />
        </td>
      </tr>
      <tr>
        <td className={classes.collapseTableDataCell} colSpan={3}>
          <Collapse in={collapseOpen} w="100%">
            <Text color="dimmed" mb="md">
              TODO: Display further information, like transcoding, stream information, progress and
              more here
            </Text>
          </Collapse>
        </td>
      </tr>
    </>
  );
};

const useStyles = createStyles(() => ({
  collapseTableDataCell: {
    border: 'none !important',
    padding: '0 !important',
  },
}));
