import { Anchor, Box, Collapse, Flex, Table, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useTranslation } from 'next-i18next';
import { usePackageAttributesStore } from '../../../tools/client/zustands/usePackageAttributesStore';

export default function Credits() {
  const { t } = useTranslation('settings/common');

  return (
    <Flex justify="center" direction="column" mt="xs">
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
      <DependencyTable />
    </Flex>
  );
}

const DependencyTable = () => {
  const { t } = useTranslation('settings/common');
  const [opened, { toggle }] = useDisclosure(false);
  const { attributes } = usePackageAttributesStore();
  return (
    <>
      <Text variant="link" mx="auto" size="xs" opacity={0.3} onClick={toggle}>
        {t('credits.thirdPartyContent')}
      </Text>

      <Collapse in={opened}>
        <Box
          sx={(theme) => ({
            backgroundColor:
              theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
            padding: theme.spacing.xl,
            borderRadius: theme.radius.md,
          })}
          mt="md"
        >
          <Table>
            <thead>
              <tr>
                <th>{t('credits.thirdPartyContentTable.dependencyName')}</th>
                <th>{t('credits.thirdPartyContentTable.dependencyVersion')}</th>
              </tr>
            </thead>
            {Object.keys(attributes.dependencies).map((key, index) => (
              <tbody key={`dependency-${index}`}>
                <tr>
                  <td>{key}</td>
                  <td>{attributes.dependencies[key]}</td>
                </tr>
              </tbody>
            ))}
          </Table>
        </Box>
      </Collapse>
    </>
  );
};
