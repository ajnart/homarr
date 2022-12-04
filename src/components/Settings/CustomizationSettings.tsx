import { Stack } from '@mantine/core';
import { useConfigContext } from '../../config/provider';
import { ColorSelector } from './Customization/ColorSelector';
import { BackgroundChanger } from './Customization/BackgroundChanger';
import { CustomCssChanger } from './Customization/CustomCssChanger';
import { FaviconChanger } from './Customization/FaviconChanger';
import { LogoImageChanger } from './Customization/LogoImageChanger';
import { MetaTitleChanger } from './Customization/MetaTitleChanger';
import { PageTitleChanger } from './Customization/PageTitleChanger';
import { OpacitySelector } from './Customization/OpacitySelector';
import { ShadeSelector } from './Customization/ShadeSelector';
import { LayoutSelector } from './Customization/LayoutSelector';

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
