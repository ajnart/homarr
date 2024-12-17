import {
  Alert,
  Button,
  Checkbox,
  CopyButton,
  Input,
  Modal,
  PasswordInput,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useState } from 'react';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import { getServerAuthSession } from '~/server/auth';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { checkForSessionOrAskForLogin } from '~/tools/server/loginBuilder';
import { api } from '~/utils/api';

/**
 * 1. Send selected options to the server
 * 2. Create a download token and send it back to the client
 * 3. Client downloads the ZIP file
 * 4. Client shows the encryption key in a modal
 */

const ManagementPage = () => {
  const { t } = useTranslation('manage/migrate');
  const metaTitle = `${t('metaTitle')} • Homarr`;
  const { mutateAsync } = api.migrate.createToken.useMutation();
  const [options, setOptions] = useState({
    boards: true,
    integrations: true,
    users: true,
  });
  const [token, setToken] = useState<string | null>(null);
  const [opened, setOpened] = useState(false);
  const onClick = async () => {
    await mutateAsync(options, {
      onSuccess: (token) => {
        // Download ZIP file
        const link = document.createElement('a');
        const baseUrl = window.location.origin;
        link.href = `${baseUrl}/api/migrate?token=${token}`;
        link.download = 'migration.zip';
        link.click();

        // Token is only needed when exporting users or integrations
        if (options.users || options.integrations) {
          setToken(token);
          setOpened(true);
        }
      },
    });
  };

  return (
    <ManageLayout>
      <Head>
        <title>{metaTitle}</title>
      </Head>

      <Stack>
        <Title order={1}>{t('pageTitle')}</Title>
        <Text>{t('description')}</Text>

        <Alert color="blue" title={t('securityNote.title')}>
          {t('securityNote.text')}
        </Alert>

        <Input.Wrapper label={t('form.label')}>
          <Stack ml="md" mt="md">
            <Checkbox
              label={t('form.option.boards.label')}
              checked={options.boards}
              onChange={(event) =>
                setOptions((prev) => ({
                  ...prev,
                  boards: event.target.checked,
                  integrations: false,
                }))
              }
            />
            <Checkbox
              label={t('form.option.integrations.label')}
              disabled={!options.boards}
              checked={options.integrations}
              onChange={(event) =>
                setOptions((prev) => ({ ...prev, integrations: event.target.checked }))
              }
              description={t('form.option.integrations.description')}
            />
            <Checkbox
              label={t('form.option.users.label')}
              checked={options.users}
              onChange={(event) => setOptions((prev) => ({ ...prev, users: event.target.checked }))}
              description={t('form.option.users.description')}
            />
          </Stack>
        </Input.Wrapper>

        <Button onClick={onClick}>{t('action.export')}</Button>
      </Stack>

      <Modal opened={opened} onClose={() => setOpened(false)} title={t('modal.title')}>
        {token && (
          <Stack>
            <Text>{t('modal.description')}</Text>
            <PasswordInput value={token} />
            <CopyButton value={token}>
              {({ copy }) => (
                <Button
                  onClick={() => {
                    copy();
                    setToken(null);
                    setOpened(false);
                  }}
                >
                  {t('modal.copyDismiss')}
                </Button>
              )}
            </CopyButton>
          </Stack>
        )}
      </Modal>
    </ManageLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  const result = checkForSessionOrAskForLogin(ctx, session, () => Boolean(session?.user.isAdmin));
  if (result) {
    return result;
  }

  const translations = await getServerSideTranslations(
    ['layout/manage', 'manage/migrate'],
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

export default ManagementPage;
