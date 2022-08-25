import path from 'path';
import fs from 'fs';

export function getConfig(name: string, props: any = undefined) {
  // Check if the config file exists
  const configPath = path.join(process.cwd(), 'data/configs', `${name}.json`);
  if (!fs.existsSync(configPath)) {
    return {
      props: {
        configName: name,
        config: {
          name: name.toString(),
          services: [],
          settings: {
            searchUrl: 'https://www.google.com/search?q=',
          },
          modules: {
            'Search Bar': {
              enabled: true,
            },
          },
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
      ...props,
    },
  };
}
