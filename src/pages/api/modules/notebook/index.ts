import { getCookie } from 'cookies-next';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { produce } from 'immer';
import path from 'path';
import { getConfig } from '../../../../tools/config/getConfig';

export async function POST(request: NextApiRequest, res: NextApiResponse) {
  //Get config file name
  const configName = getCookie('config-name', { req: request });
  //Get config file content from file name
  const config = getConfig(configName?.toString() ?? 'default');
  //get widget id and text content
  const { content, id } = request.body;
  // Use immer to change the content of the widget
  const nextState = produce(config, (draft) => {
    const widget = draft.widgets.find((widget) => widget.id === id);
    if (widget) {
      widget.properties.content = content;
    }
    return draft;
  });

  const targetPath = path.join('data/configs', `${configName}.json`);
  const result = fs.writeFileSync(targetPath, JSON.stringify(nextState, null, 2), 'utf8');
  if (result !== undefined) {
    return res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
    });
  }
  return res.status(200).json({
    content,
    id,
  });
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // Filter out if the request is a Put or a GET
  if (req.method === 'POST') {
    return POST(req, res);
  }

  return res.status(405).json({
    statusCode: 405,
    message: 'Method not allowed',
  });
};
