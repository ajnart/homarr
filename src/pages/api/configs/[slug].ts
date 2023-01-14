import fs from 'fs';
import path from 'path';
import Consola from 'consola';
import { NextApiRequest, NextApiResponse } from 'next';
import { BackendConfigType, ConfigType } from '../../../types/config';
import { getConfig } from '../../../tools/config/getConfig';

function Put(req: NextApiRequest, res: NextApiResponse) {
  // Get the slug of the request
  const { slug } = req.query as { slug: string };
  // Get the body of the request
  const { body: config }: { body: ConfigType } = req;
  if (!slug || !config) {
    Consola.warn('Rejected configuration update because either config or slug were undefined');
    return res.status(400).json({
      error: 'Wrong request',
    });
  }

  Consola.info(`Saving updated configuration of '${slug}' config.`);

  const previousConfig = getConfig(slug);

  const newConfig: BackendConfigType = {
    ...config,
    apps: [
      ...config.apps.map((app) => ({
        ...app,
        integration: {
          ...app.integration,
          properties: app.integration.properties.map((property) => {
            if (property.type === 'public') {
              return {
                field: property.field,
                type: property.type,
                value: property.value,
              };
            }

            const previousApp = previousConfig.apps.find(
              (previousApp) => previousApp.id === app.id
            );

            const previousProperty = previousApp?.integration?.properties.find(
              (previousProperty) => previousProperty.field === property.field
            );

            if (property.value !== undefined && property.value !== null) {
              Consola.info(
                'Detected credential change of private secret. Value will be overwritten in configuration'
              );
              return {
                field: property.field,
                type: property.type,
                value: property.value,
              };
            }

            return {
              field: property.field,
              type: property.type,
              value: previousProperty?.value,
            };
          }),
        },
      })),
    ],
  };

  // Save the body in the /data/config folder with the slug as filename
  const targetPath = path.join('data/configs', `${slug}.json`);
  fs.writeFileSync(targetPath, JSON.stringify(newConfig, null, 2), 'utf8');

  Consola.debug(`Config '${slug}' has been updated and flushed to '${targetPath}'.`);

  return res.status(200).json({
    message: 'Configuration saved with success',
  });
}

function Get(req: NextApiRequest, res: NextApiResponse) {
  // Get the slug of the request
  const { slug } = req.query as { slug: string };
  if (!slug) {
    return res.status(400).json({
      message: 'Wrong request',
    });
  }

  // Loop over all the files in the /data/configs directory
  // Get all the configs in the /data/configs folder
  // All the files that end in ".json"
  const files = fs.readdirSync('./data/configs').filter((file) => file.endsWith('.json'));

  // Strip the .json extension from the file name
  const configs = files.map((file) => file.replace('.json', ''));

  // If the target is not in the list of files, return an error
  if (!configs.includes(slug)) {
    return res.status(404).json({
      message: 'Target not found',
    });
  }

  // Return the content of the file
  return res.status(200).json(fs.readFileSync(path.join('data/configs', `${slug}.json`), 'utf8'));
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // Filter out if the reuqest is a Put or a GET
  if (req.method === 'PUT') {
    return Put(req, res);
  }

  if (req.method === 'DELETE') {
    return Delete(req, res);
  }

  if (req.method === 'GET') {
    return Get(req, res);
  }

  return res.status(405).json({
    statusCode: 405,
    message: 'Method not allowed',
  });
};

function Delete(req: NextApiRequest, res: NextApiResponse<any>) {
  // Get the slug of the request
  const { slug } = req.query as { slug: string };
  if (!slug) {
    return res.status(400).json({
      message: 'Wrong request',
    });
  }

  // Loop over all the files in the /data/configs directory
  // Get all the configs in the /data/configs folder
  // All the files that end in ".json"
  const files = fs.readdirSync('./data/configs').filter((file) => file.endsWith('.json'));

  // Strip the .json extension from the file name
  const configs = files.map((file) => file.replace('.json', ''));

  // If the target is not in the list of files, return an error
  if (!configs.includes(slug)) {
    return res.status(404).json({
      message: 'Target not found',
    });
  }

  // Delete the file
  fs.unlinkSync(path.join('data/configs', `${slug}.json`));
  return res.status(200).json({
    message: 'Configuration deleted with success',
  });
}
