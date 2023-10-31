import { Anchor, Avatar, Group, ScrollArea, Stack, Table, Text, createStyles } from '@mantine/core';
import cx from 'clsx';
import Link from 'next/link';
import { useState } from 'react';

import CrowdinReport from '../../../../../data/crowdin-report.json';

export function TranslatorsTable() {
  // Only the first 30 translators are shown
  const translators = CrowdinReport.data.slice(0, 30);

  const rows = translators.map((translator) => (
    <tr key={translator.user.id}>
      <td>
        <Anchor href={`https://crowdin.com/profile/${translator.user.username}`} target="_blank">
          <Group noWrap>
            <Avatar
              size={25}
              radius="lg"
              src={translator.user.avatarUrl}
              alt={translator.user.username}
            />
            {translator.user.username}
          </Group>
        </Anchor>
      </td>
      <td>{translator.translated}</td>
      <td>{translator.approved}</td>
      <td>{translator.target}</td>
      <td>
        <Text lineClamp={1}>
          {translator.languages.map((language) => (
            <span key={language.id}>{language.name}, </span>
          ))}
        </Text>
      </td>
    </tr>
  ));

  return (
    <Stack>
      <h5>Credits to our amazing translators</h5>

      <ScrollArea h={800}>
        <Table miw={700}>
          <thead>
            <tr>
              <th>Translator</th>
              <th>Translated</th>
              <th>Approved</th>
              <th>Target</th>
              <th>Languages</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </ScrollArea>
    </Stack>
  );
}
