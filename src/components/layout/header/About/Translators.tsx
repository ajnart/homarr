import {
  Anchor,
  Avatar,
  Group,
  Pagination,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { usePagination } from '@mantine/hooks';
import { Trans, useTranslation } from 'next-i18next';

import CrowdinReport from '../../../../../data/crowdin-report.json';

const PAGINATION_ITEMS = 20;

export function TranslatorsTable({ loadedLanguages }: { loadedLanguages: number }) {
  const { t } = useTranslation(['layout/modals/about']);
  const translators = CrowdinReport.data;
  const pagination = usePagination({
    total: translators.length / PAGINATION_ITEMS,
    initialPage: 1,
  });

  const rows = translators
    .slice(
      (pagination.active - 1) * PAGINATION_ITEMS,
      (pagination.active - 1) * PAGINATION_ITEMS + PAGINATION_ITEMS
    )
    .map((translator) => (
      <tr key={translator.user.id}>
        <td
          style={{
            width: 400,
          }}
        >
          <Anchor href={`https://crowdin.com/profile/${translator.user.username}`} target="_blank">
            <Group noWrap>
              <Avatar
                size={25}
                radius="lg"
                src={translator.user.avatarUrl}
                alt={translator.user.username}
              />
              {translator.user.fullName}
            </Group>
          </Anchor>
        </td>
        <td
          style={{
            width: 400,
          }}
        >
          {translator.translated}
        </td>
        <td
          style={{
            width: 400,
          }}
        >
          {translator.approved}
        </td>
        <td
          style={{
            width: 400,
          }}
        >
          {translator.target}
        </td>
        <td
          style={{
            width: 400,
          }}
        >
          <Text lineClamp={1}>
            {translator.languages.map((language, index) => (
              <span key={language.id}>{language.name}{(index < translator.languages.length - 1 ? ", " : "")}</span>
            ))}
          </Text>
        </td>
      </tr>
    ));

  return (
    <Stack>
      <Title order={3}>{t('translators', { count: translators.length })}</Title>
      <Text>
        <Trans
          i18nKey="layout/modals/about:translatorsDescription"
          values={{
            languages: loadedLanguages,
          }}
          components={{
            a: <Anchor href="https://homarr.dev/docs/community/translations" target="_blank" />,
          }}
        />
      </Text>
      <Table withBorder>
        <thead>
          <tr>
            <th>Name</th>
            <th>Translated</th>
            <th>Approved</th>
            <th>Target</th>
            <th>Languages</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
      <Pagination
        style={{
          justifyContent: 'center',
        }}
        total={translators.length / PAGINATION_ITEMS}
        value={pagination.active}
        onNextPage={() => pagination.next()}
        onPreviousPage={() => pagination.previous()}
        onChange={(targetPage) => pagination.setPage(targetPage)}
      />
    </Stack>
  );
}
