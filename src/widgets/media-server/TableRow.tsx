import { Avatar, Collapse, createStyles, Flex, Text } from '@mantine/core';
import { useState } from 'react';
import { AppAvatar } from '../../components/AppAvatar';
import { GenericSessionInfo } from '../../types/api/media-server/session-info';
import { AppType } from '../../types/app';
import { DetailCollapseable } from './DetailCollapseable';
import { NowPlayingDisplay } from './NowPlayingDisplay';

interface TableRowProps {
  session: GenericSessionInfo;
  app: AppType | undefined;
}

export const TableRow = ({ session, app }: TableRowProps) => {
  const [collapseOpen, setCollapseOpen] = useState(false);
  const hasUserThumb = session.userProfilePicture !== undefined;
  const { classes } = useStyles();
  return (
    <>
      <tr className={classes.dataRow} onClick={() => setCollapseOpen(!collapseOpen)}>
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
      <tr>
        <td className={classes.collapseTableDataCell} colSpan={3}>
          <Collapse in={collapseOpen} w="100%">
            <DetailCollapseable session={session} />
          </Collapse>
        </td>
      </tr>
    </>
  );
};

const useStyles = createStyles(() => ({
  dataRow: {
    cursor: 'pointer',
  },
  collapseTableDataCell: {
    border: 'none !important',
    padding: '0 !important',
  },
}));
