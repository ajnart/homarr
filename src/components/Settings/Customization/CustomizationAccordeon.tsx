import { Accordion, Checkbox, Grid, Group, Stack, Text } from '@mantine/core';
import { IconBrush, IconChartCandle, IconCode, IconDragDrop, IconLayout } from '@tabler/icons-react';
import { i18n, useTranslation } from 'next-i18next';
import { ReactNode } from 'react';
import { GridstackConfiguration } from './Layout/GridstackConfiguration';
import { LayoutSelector } from './Layout/LayoutSelector';
import { BackgroundChanger } from './Meta/BackgroundChanger';
import { FaviconChanger } from './Meta/FaviconChanger';
import { LogoImageChanger } from './Meta/LogoImageChanger';
import { BrowserTabTitle } from './Meta/MetaTitleChanger';
import { DashboardTitleChanger } from './Meta/PageTitleChanger';
import { ColorSelector } from './Theme/ColorSelector';
import { CustomCssChanger } from './Theme/CustomCssChanger';
import { DashboardTilesOpacitySelector } from './Theme/OpacitySelector';
import { ShadeSelector } from './Theme/ShadeSelector';

export const CustomizationSettingsAccordeon = () => {
  const items = getItems().map((item) => (
    <Accordion.Item value={item.id} key={item.label}>
      <Accordion.Control>
        <AccordionLabel {...item} />
      </Accordion.Control>
      <Accordion.Panel>
        <Text size="sm">{item.content}</Text>
      </Accordion.Panel>
    </Accordion.Item>
  ));
  return (
    <Accordion variant="contained" chevronPosition="right">
      {items}
    </Accordion>
  );
};

interface AccordionLabelProps {
  label: string;
  image: ReactNode;
  description: string;
}

const AccordionLabel = ({ label, image, description }: AccordionLabelProps) => (
  <Group noWrap>
    {image}
    <div>
      <Text>{label}</Text>
      <Text size="sm" color="dimmed" weight={400}>
        {description}
      </Text>
    </div>
  </Group>
);

const getItems = () => {
  const { t } = useTranslation([
    'settings/customization/general',
    'settings/customization/color-selector',
  ]);
  const items = [
    {
      id: 'layout',
      image: <IconLayout />,
      label: t('accordeon.layout.name'),
      description: t('accordeon.layout.description'),
      content: <LayoutSelector />,
    },
    {
      id: 'gridstack',
      image: <IconDragDrop />,
      label: t('accordeon.gridstack.name'),
      description: t('accordeon.gridstack.description'),
      content: <GridstackConfiguration />,
    },
    {
      id: 'page_metadata',
      image: <IconChartCandle />,
      label: t('accordeon.pageMetadata.name'),
      description: t('accordeon.pageMetadata.description'),
      content: (
        <>
          <DashboardTitleChanger />
          <BrowserTabTitle />
          <LogoImageChanger />
          <FaviconChanger />
        </>
      ),
    },
    {
      id: 'appereance',
      image: <IconBrush />,
      label: t('accordeon.appereance.name'),
      description: t('accordeon.appereance.description'),
      content: (
        <>
          <BackgroundChanger />

          <Stack spacing="xs" my="md">
            <Text>{t('settings/customization/color-selector:colors')}</Text>
            <Grid>
              <Grid.Col sm={12} md={6}>
                <ColorSelector type="primary" defaultValue="red" />
              </Grid.Col>
              <Grid.Col sm={12} md={6}>
                <ColorSelector type="secondary" defaultValue="orange" />
              </Grid.Col>
              <Grid.Col sm={12} md={6}>
                <ShadeSelector />
              </Grid.Col>
            </Grid>
          </Stack>

          <DashboardTilesOpacitySelector />
          <CustomCssChanger />
        </>
      ),
    },
  ];
  if (process.env.NODE_ENV === 'development') {
    items.push({
      id: 'dev',
      image: <IconCode />,
      label: 'Developer options',
      description: 'Options to help when developing',
      content: (
        <Stack>
          <Checkbox
            label="Use debug language"
            defaultChecked={i18n?.language === 'cimode'}
            description="This will show the translation keys instead of the actual translations"
            onChange={(e) =>
              // Change to CI mode language
              i18n?.changeLanguage(e.target.checked ? 'cimode' : 'en')
            }
          />
        </Stack>
      ),
    });
  }
  return items;
};
