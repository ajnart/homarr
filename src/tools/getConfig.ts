import path from 'path';
import fs from 'fs';

export function getConfig(name: string) {
  // Check if the config file exists
  const configPath = path.join(process.cwd(), 'data/configs', `${name}.json`);
  if (!fs.existsSync(configPath)) {
    return {
      props: {
        configName: name,
        config: {
          name: name.toString(),
          title: 'Homarr 🦞',
          logo: '/imgs/logo.png',
          favicon: '/favicon.svg',
          services: [],
          settings: {
            searchUrl: 'https://www.google.com/search?q=',
          },
          modules: {},
        },
      },
    };
  }

  const config = fs.readFileSync(configPath, 'utf8');
  // Print loaded config
  return {
    props: {
      configName: name,
      config: JSON.parse(config),
    },
  };
}
