import { ActionIcon, Badge, Box, Group, Title, Text, Tooltip, Button } from '@mantine/core';
import { openRoleChangeModal } from '~/components/Manage/User/change-user-role.modal';
import { IconUserDown, IconUserUp } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useSession } from 'next-auth/react';

export const ManageUserRoles = ({ user }: {
  user: {
    image: string | null;
    id: string;
    name: string | null;
    password: string | null;
    email: string | null;
    emailVerified: Date | null;
    salt: string | null;
    isAdmin: boolean;
    isOwner: boolean;
  }
}) => {
  const { t } = useTranslation('manage/users');
  const { data: sessionData } = useSession();
  return (
    <Box maw={500}>
      <Title order={3}>
        Roles
      </Title>

      <Group mb={'md'}>
        <Text>Current role:</Text>
        {user.isOwner ? (<Badge>Owner</Badge>) : user.isAdmin ? (<Badge>Admin</Badge>) : (<Badge>Normal</Badge>)}
      </Group>

      {user.isAdmin ? (
        <Button
          leftIcon={<IconUserDown size='1rem' />}
          disabled={user.id === sessionData?.user?.id || user.isOwner}
          onClick={() => {
            openRoleChangeModal({
              name: user.name as string,
              id: user.id,
              type: 'demote',
            });
          }}
        >
          {t('tooltips.demoteAdmin')}
        </Button>
      ) : (
        <Button
          leftIcon={<IconUserUp size='1rem' />}
          onClick={() => {
            openRoleChangeModal({
              name: user.name as string,
              id: user.id,
              type: 'promote',
            });
          }}
        >

          {t('tooltips.promoteToAdmin')}
        </Button>
      )}
    </Box>
  );
};