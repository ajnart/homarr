import { Anchor, Box, Button, Collapse, Container, Flex, Stack, Table, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { useTranslation } from 'next-i18next';
import { usePackageAttributesStore } from '~/tools/client/zustands/usePackageAttributesStore';

export default function Credits() {
  const { t } = useTranslation('settings/common');

  return (
    <Stack>
      <DependencyTable />
      <Text
        style={{
          fontSize: '0.90rem',
          textAlign: 'center',
          color: 'gray',
        }}
      >
        {t('credits.madeWithLove')}
        <Anchor
          href="https://github.com/ajnart"
          style={{ color: 'inherit', fontStyle: 'inherit', fontSize: 'inherit' }}
        >
          ajnart
        </Anchor>{' '}
        and you!
      </Text>
    </Stack>
  );
}

const DependencyTable = () => {
  const { t } = useTranslation('settings/common');
  const { attributes } = usePackageAttributesStore();
  return (
    <Button
      style={{
        justifyContent: 'start',
      }}
      variant="light"
      mx="auto"
      size="xs"
      onClick={() =>
        modals.open({
          title: t('credits.thirdPartyContent'),
          size: 'xl',
          children: (
            <Table>
              <thead>
                <tr>
                  <th>{t('credits.thirdPartyContentTable.dependencyName')}</th>
                  <th>{t('credits.thirdPartyContentTable.dependencyVersion')}</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(attributes.dependencies).map((key, index) => (
                  <tr>
                    <td>{key}</td>
                    <td>{attributes.dependencies[key]}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ),
        })
      }
    >
      {t('credits.thirdPartyContent')}
    </Button>
  );
};
