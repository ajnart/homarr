import { Button, ScrollArea, Stack } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '../../../config/provider';
import { useConfigStore } from '../../../config/store';
import { LayoutSelector } from './Layout/LayoutSelector';
import { BackgroundChanger } from './Meta/BackgroundChanger';
import { FaviconChanger } from './Meta/FaviconChanger';
import { LogoImageChanger } from './Meta/LogoImageChanger';
import { MetaTitleChanger } from './Meta/MetaTitleChanger';
import { PageTitleChanger } from './Meta/PageTitleChanger';
import { ColorSelector } from './Theme/ColorSelector';
import { CustomCssChanger } from './Theme/CustomCssChanger';
import { OpacitySelector } from './Theme/OpacitySelector';
import { ShadeSelector } from './Theme/ShadeSelector';

export default function CustomizationSettings() {
  const { config, name: configName } = useConfigContext();
  const { t } = useTranslation('common');
  const { height, width } = useViewportSize();

  const { updateConfig } = useConfigStore();

  return (
    <ScrollArea style={{ height: height - 100 }} offsetScrollbars>
      <Stack mt="xs" mb="md" spacing="xs">
        <LayoutSelector defaultLayout={config?.settings.customization.layout} />
        <PageTitleChanger defaultValue={config?.settings.customization.pageTitle} />
        <MetaTitleChanger defaultValue={config?.settings.customization.metaTitle} />
        <LogoImageChanger defaultValue={config?.settings.customization.logoImageUrl} />
        <FaviconChanger defaultValue={config?.settings.customization.faviconUrl} />
        <BackgroundChanger defaultValue={config?.settings.customization.backgroundImageUrl} />
        <CustomCssChanger defaultValue={config?.settings.customization.customCss} />
        <ColorSelector
          type="primary"
          defaultValue={config?.settings.customization.colors.primary}
        />
        <ColorSelector
          type="secondary"
          defaultValue={config?.settings.customization.colors.secondary}
        />
        <ShadeSelector defaultValue={config?.settings.customization.colors.shade} />
        <OpacitySelector defaultValue={config?.settings.customization.appOpacity} />
      </Stack>
    </ScrollArea>
  );
}
