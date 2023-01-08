import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import { backendMigrateConfig } from '../../tools/config/backendMigrateConfig';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // Get all the configs in the /data/configs folder
  const configs = fs.readdirSync('./data/configs');
  // If there is no config, redirect to the index
  configs.every((config) => {
    const configData = JSON.parse(fs.readFileSync(`./data/configs/${config}`, 'utf8'));
    if (!configData.schemaVersion) {
      // Migrate the config
      backendMigrateConfig(configData, config.replace('.json', ''));
    }
    return config;
  });
  return res.status(200).json({
    success: true,
    message: 'Configs migrated',
  });
};
