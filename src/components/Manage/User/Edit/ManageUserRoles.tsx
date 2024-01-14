import { Badge, Box, Button, Group, Text, Title } from '@mantine/core';
import { openRoleChangeModal } from '~/components/Manage/User/change-user-role.modal';
import { IconUserDown, IconUserUp } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useSession } from 'next-auth/react';
import { createSelectSchema } from 'drizzle-zod';
import { users } from '~/server/db/schema';
import { z } from 'zod';

const userWithoutSecrets = createSelectSchema(users).omit({
  password: true,
  salt: true,
});

export const ManageUserRoles = ({ user }: {
  user: z.infer<typeof userWithoutSecrets>
}) => {
  const { t } = useTranslation(['manage/users/edit', 'manage/users']);
  const { data: sessionData } = useSession();

  return (
    <Box maw={500}>
      <Title order={3}>
        {t('sections.roles.title')}
      </Title>

      <Group mb={'md'}>
        <Text>{t('sections.roles.currentRole')}</Text>
        {user.isOwner ? (<Badge>{t('sections.roles.badges.owner')}</Badge>) : user.isAdmin ? (
          <Badge>{t('sections.roles.badges.admin')}</Badge>) : (<Badge>{t('sections.roles.badges.normal')}</Badge>)}
      </Group>

      {user.isAdmin ? (
        <Button
          leftIcon={<IconUserDown size="1rem" />}
          disabled={user.id === sessionData?.user?.id || user.isOwner}
          onClick={() => {
            openRoleChangeModal({
              name: user.name as string,
              id: user.id,
              type: 'demote',
            });
          }}
        >
          {t('manage/users:tooltips.demoteAdmin')}
        </Button>
      ) : (
        <Button
          leftIcon={<IconUserUp size="1rem" />}
          onClick={() => {
            openRoleChangeModal({
              name: user.name as string,
              id: user.id,
              type: 'promote',
            });
          }}
        >

          {t('manage/users:tooltips.promoteToAdmin')}
        </Button>
      )}
    </Box>
  );
};