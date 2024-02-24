import {
  CheckIcon,
  ColorSwatch,
  Group,
  Input,
  MantineTheme,
  Select,
  Slider,
  Stack,
  TextInput,
  createStyles,
  rem,
  useMantineTheme,
} from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { highlight, languages } from 'prismjs';
import Editor from 'react-simple-code-editor';
import { useColorTheme } from '~/tools/color';
import {
  BackgroundImageAttachment,
  BackgroundImageRepeat,
  BackgroundImageSize,
} from '~/types/settings';

import { useBoardCustomizationFormContext } from '../form';

export const AppearanceCustomization = () => {
  const { t } = useTranslation('settings/customization/page-appearance');
  const form = useBoardCustomizationFormContext();

  return (
    <Stack spacing="sm">
      <TextInput
        label={t('background.label')}
        placeholder="/imgs/backgrounds/background.png"
        {...form.getInputProps('appearance.backgroundSrc')}
      />
      <Select
        label={t('backgroundImageAttachment.label')}
        data={BackgroundImageAttachment.map((attachment) => ({
          value: attachment,
          label: t(`backgroundImageAttachment.options.${attachment}`) as string,
        }))}
        {...form.getInputProps('appearance.backgroundImageAttachment')}
      />

      <Select
        label={t('backgroundImageSize.label')}
        data={BackgroundImageSize.map((size) => ({
          value: size,
          label: t(`backgroundImageSize.options.${size}`) as string,
        }))}
        {...form.getInputProps('appearance.backgroundImageSize')}
      />

      <Select
        label={t('backgroundImageRepeat.label')}
        data={BackgroundImageRepeat.map((repeat) => ({
          value: repeat,
          label: t(`backgroundImageRepeat.options.${repeat}`) as string,
        }))}
        {...form.getInputProps('appearance.backgroundImageRepeat')}
      />
      <ColorSelector type="primaryColor" />
      <ColorSelector type="secondaryColor" />
      <ShadeSelector />
      <OpacitySlider />
      <CustomCssInput />
    </Stack>
  );
};

type ColorSelectorProps = {
  type: 'primaryColor' | 'secondaryColor';
};
const ColorSelector = ({ type }: ColorSelectorProps) => {
  const { t } = useTranslation('boards/customize');
  const theme = useMantineTheme();
  const form = useBoardCustomizationFormContext();
  const { setPrimaryColor, setSecondaryColor } = useColorTheme();

  const colors = Object.keys(theme.colors).map((color) => ({
    swatch: theme.colors[color][6],
    color,
  }));

  return (
    <Input.Wrapper label={t(`settings.appearance.${type}`)}>
      <Group>
        {colors.map(({ color, swatch }) => (
          <ColorSwatch
            key={color}
            component="button"
            type="button"
            onClick={() => {
              form.getInputProps(`appearance.${type}`).onChange(color);
              if (type === 'primaryColor') {
                setPrimaryColor(color);
              } else {
                setSecondaryColor(color);
              }
            }}
            color={swatch}
            style={{ cursor: 'pointer' }}
          >
            {color === form.values.appearance[type] && <CheckIcon width={rem(10)} />}
          </ColorSwatch>
        ))}
      </Group>
    </Input.Wrapper>
  );
};

const ShadeSelector = () => {
  const form = useBoardCustomizationFormContext();
  const theme = useMantineTheme();
  const { setPrimaryShade } = useColorTheme();

  const primaryColor = form.values.appearance.primaryColor;
  const primaryShades = theme.colors[primaryColor].map((_, shade) => ({
    swatch: theme.colors[primaryColor][shade],
    shade,
  }));

  return (
    <Input.Wrapper label="Shade">
      <Group>
        {primaryShades.map(({ shade, swatch }) => (
          <ColorSwatch
            key={shade}
            component="button"
            type="button"
            onClick={() => {
              form.getInputProps(`appearance.shade`).onChange(shade);
              setPrimaryShade(shade as MantineTheme['primaryShade']);
            }}
            color={swatch}
            style={{ cursor: 'pointer' }}
          >
            {shade === form.values.appearance.shade && <CheckIcon width={rem(10)} />}
          </ColorSwatch>
        ))}
      </Group>
    </Input.Wrapper>
  );
};

const OpacitySlider = () => {
  const { t } = useTranslation('settings/customization/opacity-selector');
  const form = useBoardCustomizationFormContext();

  return (
    <Input.Wrapper label={t('label')} mb="sm">
      <Slider
        step={10}
        min={10}
        marks={opacityMarks}
        styles={{ markLabel: { fontSize: 'xx-small' } }}
        {...form.getInputProps('appearance.opacity')}
      />
    </Input.Wrapper>
  );
};

const opacityMarks = [
  { value: 10, label: '10%' },
  { value: 20, label: '20%' },
  { value: 30, label: '30%' },
  { value: 40, label: '40%' },
  { value: 50, label: '50%' },
  { value: 60, label: '60%' },
  { value: 70, label: '70%' },
  { value: 80, label: '80%' },
  { value: 90, label: '90%' },
  { value: 100, label: '100%' },
];

const CustomCssInput = () => {
  const { t } = useTranslation('settings/customization/page-appearance');
  const { classes } = useStyles();
  const form = useBoardCustomizationFormContext();

  return (
    <Input.Wrapper
      label={t('customCSS.label')}
      description={t('customCSS.description')}
      inputWrapperOrder={['label', 'description', 'input', 'error']}
    >
      <div className={classes.codeEditorRoot}>
        <Editor
          {...form.getInputProps('appearance.customCss')}
          onValueChange={(code) => form.getInputProps('appearance.customCss').onChange(code)}
          highlight={(code) => highlight(code, languages.extend('css', {}), 'css')}
          padding={10}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 12,
            minHeight: 250,
          }}
        />
      </div>
    </Input.Wrapper>
  );
};

const useStyles = createStyles(({ colors, colorScheme, radius }) => ({
  codeEditorFooter: {
    borderBottomLeftRadius: radius.sm,
    borderBottomRightRadius: radius.sm,
    backgroundColor: colorScheme === 'dark' ? colors.dark[7] : undefined,
  },
  codeEditorRoot: {
    marginTop: 4,
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
