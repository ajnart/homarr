import { TextInput, Group, Button } from '@mantine/core';
import { useState } from 'react';
import { useConfig } from '../../tools/state';

export default function TitleChanger() {
  const { config, loadConfig, setConfig, getConfigs } = useConfig();
  const [customTitle, setCustomTitle] = useState(config.title);
  const [customLogo, setCustomLogo] = useState(config.logo);
  const [customFavicon, setCustomFavicon] = useState(config.favicon);

  const saveChanges = () => {
    setConfig({
      ...config,
      title: customTitle || "Homarr 🦞",
      logo: customLogo || "/imgs/logo.png",
      favicon: customFavicon || "/favicon.svg",
    });
  }

  return (
    <Group grow direction="column">
      <TextInput
        label="Page title"
        defaultValue={config.title}
        value={customTitle}
        onChange={(event) => setCustomTitle(event.currentTarget.value)}
      />
      <TextInput
        label="Logo"
        defaultValue={config.logo}
        value={customLogo}
        onChange={(event) => setCustomLogo(event.currentTarget.value)}
      />
      <TextInput
        label="Favicon"
        defaultValue={config.favicon}
        value={customFavicon}
        onChange={(event) => setCustomFavicon(event.currentTarget.value)}
      />
      <Button
        variant="gradient"
        gradient={{ from: 'red', to: 'orange' }}
        onClick={() => saveChanges()}
      >
        Save
      </Button>
    </Group>
  );
}
