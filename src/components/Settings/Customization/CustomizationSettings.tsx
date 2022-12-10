import { Stack } from '@mantine/core';
import { useConfigContext } from '../../../config/provider';
import { ColorSelector } from './Theme/ColorSelector';
import { BackgroundChanger } from './Meta/BackgroundChanger';
import { CustomCssChanger } from './Theme/CustomCssChanger';
import { FaviconChanger } from './Meta/FaviconChanger';
import { LogoImageChanger } from './Meta/LogoImageChanger';
import { MetaTitleChanger } from './Meta/MetaTitleChanger';
import { PageTitleChanger } from './Meta/PageTitleChanger';
import { OpacitySelector } from './Theme/OpacitySelector';
import { ShadeSelector } from './Theme/ShadeSelector';
import { LayoutSelector } from './Layout/LayoutSelector';

export default function CustomizationSettings() {
  const { config } = useConfigContext();

  return (
    <Stack mb="md" mr="sm" mt="xs">
      <LayoutSelector defaultLayout={config?.settings.customization.layout} />
      <PageTitleChanger defaultValue={config?.settings.customization.pageTitle} />
      <MetaTitleChanger defaultValue={config?.settings.customization.metaTitle} />
      <LogoImageChanger defaultValue={config?.settings.customization.logoImageUrl} />
      <FaviconChanger defaultValue={config?.settings.customization.faviconUrl} />
      <BackgroundChanger defaultValue={config?.settings.customization.backgroundImageUrl} />
      <CustomCssChanger defaultValue={config?.settings.customization.customCss} />
      <ColorSelector type="primary" defaultValue={config?.settings.customization.colors.primary} />
      <ColorSelector
        type="secondary"
        defaultValue={config?.settings.customization.colors.secondary}
      />
      <ShadeSelector defaultValue={config?.settings.customization.colors.shade} />
      <OpacitySelector defaultValue={config?.settings.customization.appOpacity} />
    </Stack>
  );
}
