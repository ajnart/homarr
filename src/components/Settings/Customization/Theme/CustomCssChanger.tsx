import { Box, createStyles, Group, Loader, Stack, Text, useMantineTheme } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import { useConfigContext } from '../../../../config/provider';
import { useConfigStore } from '../../../../config/store';
import 'prismjs/components/prism-css';
import 'prismjs/themes/prism.css';

export const CustomCssChanger = () => {
  const { t } = useTranslation('settings/customization/page-appearance');
  const updateConfig = useConfigStore((x) => x.updateConfig);
  const { colorScheme, colors } = useMantineTheme();
  const { config, name: configName } = useConfigContext();
  const [nonDebouncedCustomCSS, setNonDebouncedCustomCSS] = useState(
    config?.settings.customization.customCss ?? ''
  );
  const [debouncedCustomCSS] = useDebouncedValue(nonDebouncedCustomCSS, 696);
  const { classes } = useStyles();

  if (!configName) return null;

  useEffect(() => {
    updateConfig(configName, (prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        customization: {
          ...prev.settings.customization,
          customCss: debouncedCustomCSS,
        },
      },
    }));
  }, [debouncedCustomCSS]);

  const codeIsDirty = nonDebouncedCustomCSS !== debouncedCustomCSS;
  const codeEditorHeight = codeIsDirty ? 250 - 42 : 250;

  return (
    <Stack spacing={4} mt="xl">
      <Text>{t('customCSS.label')}</Text>
      <Text color="dimmed" size="xs">
        {t('customCSS.description')}
      </Text>
      <div className={classes.codeEditorRoot}>
        <Editor
          value={nonDebouncedCustomCSS}
          onValueChange={(code) => setNonDebouncedCustomCSS(code)}
          highlight={(code) => highlight(code, languages.extend('css', {}), 'css')}
          padding={10}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 12,
            minHeight: codeEditorHeight,
          }}
        />
        {codeIsDirty && (
          <Box className={classes.codeEditorFooter}>
            <Group p="xs" spacing="xs">
              <Loader color={colors.gray[0]} size={18} />
              <Text>{t('customCSS.applying')}</Text>
            </Group>
          </Box>
        )}
      </div>
    </Stack>
  );
};

const useStyles = createStyles(({ colors, colorScheme, radius }) => ({
  codeEditorFooter: {
    borderBottomLeftRadius: radius.sm,
    borderBottomRightRadius: radius.sm,
    backgroundColor: colorScheme === 'dark' ? colors.dark[7] : undefined,
  },
  codeEditorRoot: {
    borderColor: colorScheme === 'dark' ? colors.dark[4] : colors.gray[4],
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: radius.sm,
  },
  codeEditor: {
    backgroundColor: colorScheme === 'dark' ? colors.dark[6] : 'white',
    fontSize: 12,

    '& ::placeholder': {
      color: colorScheme === 'dark' ? colors.dark[3] : colors.gray[5],
    },
  },
}));
