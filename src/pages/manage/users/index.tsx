import {
  Avatar,
  Badge,
  Button,
  Flex,
  Grid,
  Group,
  Loader,
  NavLink,
  Pagination,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useDebouncedValue } from '@mantine/hooks';
import { IconPencil, IconUser, IconUserPlus, IconUserShield, IconUserStar, IconX } from '@tabler/icons-react';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { z } from 'zod';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import { getServerAuthSession } from '~/server/auth';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { checkForSessionOrAskForLogin } from '~/tools/server/loginBuilder';
import { manageNamespaces } from '~/tools/server/translation-namespaces';
import { api } from '~/utils/api';

export const PossibleRoleFilter = [
  {
    id: 'all',
    icon: IconUser,
  },
  {
    id: 'owner',
    icon: IconUserStar,
  },
  {
    id: 'admin',
    icon: IconUserShield,
  },
  {
    id: 'normal',
    icon: IconUser,
  },
];

const ManageUsersPage = () => {
  const [activePage, setActivePage] = useState(0);
  const form = useForm({
    initialValues: {
      fullTextSearch: '',
      role: PossibleRoleFilter[0].id,
    },
    validate: zodResolver(
      z.object({
        fullTextSearch: z.string(),
        role: z
          .string()
          .transform((value) => (value.length > 0 ? value : undefined))
          .optional(),
      })
    ),
  });
  const [debouncedForm] = useDebouncedValue(form, 200);
  const { data, isLoading } = api.user.all.useQuery({
    page: activePage,
    search: debouncedForm.values,
  });

  const { t } = useTranslation(['manage/users', 'common']);

  const metaTitle = `${t('metaTitle')} • Homarr`;

  return (
    <ManageLayout>
      <Head>
        <title>{metaTitle}</title>
      </Head>

      <Title mb="md">{t('pageTitle')}</Title>

      <Flex columnGap={10} mb="md">
        <TextInput
          rightSection={
            <IconX
              onClick={() => {
                form.setFieldValue('fullTextSearch', '');
              }}
              size="1rem"
            />
          }
          style={{
            flexGrow: 1,
          }}
          placeholder="Filter"
          variant="filled"
          {...form.getInputProps('fullTextSearch')}
        />
        <Button
          component={Link}
          leftIcon={<IconUserPlus size="1rem" />}
          href="/manage/users/create"
          color="green"
          variant="light"
          px="xl"
        >
          {t('buttons.create')}
        </Button>
      </Flex>

      <Grid>
        <Grid.Col xs={12} md={4}>
          <Text color="dimmed" size="sm" mb="xs">
            Roles
          </Text>
          {PossibleRoleFilter.map((role) => (
            <NavLink
              key={role.id}
              icon={<role.icon size="1rem" />}
              rightSection={!isLoading && data && <Badge>{data?.stats.roles[role.id]}</Badge>}
              label={t(`filter.roles.${role.id}`)}
              active={form.values.role === role.id}
              onClick={() => {
                form.setFieldValue('role', role.id);
              }}
              sx={(theme) => ({
                borderRadius: theme.radius.md,
                marginBottom: 5,
              })}
            />
          ))}
        </Grid.Col>
        <Grid.Col xs={12} md={8}>
          <Table mb="md" withBorder highlightOnHover>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={4}>
                    <Group position="center" p="lg">
                      <Loader variant="dots" />
                    </Group>
                  </td>
                </tr>
              )}
              {data?.users.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <Text p="lg" color="dimmed">
                      {t('searchDoesntMatch')}
                    </Text>
                  </td>
                </tr>
              )}
              {data?.users.map((user, index) => (
                <tr key={index}>
                  <td width="1%">
                    <Avatar size="sm" />
                  </td>
                  <td>
                    <Grid grow>
                      <Grid.Col span={6} p={0}>
                        <Group spacing="xs" noWrap>
                          <Text>{user.name}</Text>
                          {user.isOwner && (
                            <Badge color="pink" size="sm">
                              Owner
                            </Badge>
                          )}
                          {user.isAdmin && (
                            <Badge color="red" size="sm">
                              Admin
                            </Badge>
                          )}
                        </Group>
                      </Grid.Col>
                      <Grid.Col span={6} p={0}>
                        {user.email ? (
                          <Text>{user.email}</Text>
                        ) : (
                          <Text color="dimmed">No E-Mail</Text>
                        )}
                      </Grid.Col>
                    </Grid>
                  </td>
                  <td width="1%">
                    <Button
                      component={Link}
                      href={`/manage/users/${user.id}/edit`}
                      leftIcon={<IconPencil size="1rem" />}
                      variant="default"
                    >
                      {t('common:edit')}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Grid.Col>
        <Group position="right" w="100%" px="sm">
          <Pagination
            onNextPage={() => {
              setActivePage((prev) => prev + 1);
            }}
            onPreviousPage={() => {
              setActivePage((prev) => prev - 1);
            }}
            onChange={(targetPage) => {
              setActivePage(targetPage - 1);
            }}
            total={data?.countPages ?? 0}
            value={activePage + 1}
            withControls
          />
        </Group>
      </Grid>
    </ManageLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  const result = checkForSessionOrAskForLogin(ctx, session, () => session?.user.isAdmin == true);
  if (result) {
    return result;
  }

  const translations = await getServerSideTranslations(
    manageNamespaces,
    ctx.locale,
    ctx.req,
    ctx.res
  );

  return {
    props: {
      ...translations,
    },
  };
};

export default ManageUsersPage;
