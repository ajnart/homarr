import { Accordion, Grid, Group, Stack, Text } from '@mantine/core';
import { IconBrush, IconChartCandle, IconDragDrop, IconLayout } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
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
  const { t } = useTranslation('settings/customization/general');
  const accordeonItems = [
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
            <Text>Colors</Text>
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

  const children = accordeonItems.map((item) => (
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
      {children}
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
