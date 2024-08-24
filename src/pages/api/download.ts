import AdmZip from 'adm-zip';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerAuthSession } from '~/server/auth';
import { getFrontendConfig } from '~/tools/config/getFrontendConfig';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerAuthSession({ req, res });
  if (!session) {
    return res.status(401).end();
  }

  if (!session.user.isAdmin) {
    return res.status(403).end();
  }

  const files = fs.readdirSync('./data/configs').filter((file) => file.endsWith('.json'));

  const zip = new AdmZip();

  for (const file of files) {
    const data = await getFrontendConfig(file.replace('.json', ''));
    const content = JSON.stringify(data, null, 2);
    zip.addFile(file, Buffer.from(content, 'utf-8'));
  }

  const zipBuffer = zip.toBuffer();
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename=board-configs.zip');
  res.setHeader('Content-Length', zipBuffer.length.toString());
  res.status(200).end(zipBuffer);
};

export default handler;
