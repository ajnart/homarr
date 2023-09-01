import Consola from 'consola';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

import { getConfig } from '../../../tools/config/getConfig';
import { BackendConfigType, ConfigType } from '../../../types/config';
import { IRssWidget } from '../../../widgets/rss/RssWidgetTile';

function Put(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.DISABLE_EDIT_MODE?.toLowerCase() === 'true') {
    return res.status(409).json({ error: 'Edit mode has been disabled by the administrator' });
  }

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

  let newConfig: BackendConfigType = {
    ...config,
    apps: [
      ...config.apps.map((app) => ({
        ...app,
        network: {
          ...app.network,
          statusCodes:
            app.network.okStatus === undefined
              ? app.network.statusCodes
              : app.network.okStatus.map((x) => x.toString()),
          okStatus: undefined,
        },
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

  newConfig = {
    ...newConfig,
    widgets: [
      ...newConfig.widgets.map((x) => {
        if (x.type !== 'rss') {
          return x;
        }

        const rssWidget = x as IRssWidget;

        return {
          ...rssWidget,
          properties: {
            ...rssWidget.properties,
            rssFeedUrl:
              typeof rssWidget.properties.rssFeedUrl === 'string'
                ? [rssWidget.properties.rssFeedUrl]
                : rssWidget.properties.rssFeedUrl,
          },
        } as IRssWidget;
      }),
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
    Consola.error('Rejected config deletion request because config slug was not present');
    return res.status(400).json({
      message: 'Wrong request',
    });
  }

  if (slug.toLowerCase() === 'default') {
    Consola.error("Rejected config deletion because default configuration can't be deleted");
    return res.status(403).json({
      message: "Default config can't be deleted",
    });
  }

  // Loop over all the files in the /data/configs directory
  // Get all the configs in the /data/configs folder
  // All the files that end in ".json"
  const files = fs.readdirSync('./data/configs').filter((file) => file.endsWith('.json'));
  // Match one file if the configProperties.name is the same as the slug
  const matchedFile = files.find((file) => {
    const config = JSON.parse(fs.readFileSync(path.join('data/configs', file), 'utf8'));
    return config.configProperties.name === slug;
  });

  // If the target is not in the list of files, return an error
  if (!matchedFile) {
    Consola.error(
      `Rejected config deletion request because config name '${slug}' was not included in present configurations`
    );
    return res.status(404).json({
      message: 'Target not found',
    });
  }

  // Delete the file
  fs.unlinkSync(path.join('data/configs', matchedFile));
  Consola.info(`Successfully deleted configuration '${slug}' from your file system`);
  return res.status(200).json({
    message: 'Configuration deleted with success',
  });
}
