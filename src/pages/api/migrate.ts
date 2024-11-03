import AdmZip from 'adm-zip';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';
import { migrateTokens } from '~/server/db/schema';
import { getConfig } from '~/tools/config/getConfig';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerAuthSession({ req, res });
  if (!session) {
    return res.status(401).end();
  }

  if (!session.user.isAdmin) {
    return res.status(403).end();
  }

  const token = req.query.token;

  if (!token || Array.isArray(token)) {
    return res.status(400).end();
  }

  const dbToken = await db.query.migrateTokens.findFirst({
    where: eq(migrateTokens.token, token),
  });

  if (!dbToken) {
    return res.status(403).end();
  }

  if (dbToken.expires < new Date()) {
    return res.status(403).end();
  }

  const files = fs.readdirSync('./data/configs').filter((file) => file.endsWith('.json'));

  const zip = new AdmZip();

  for (const file of files) {
    const data = await getConfig(file.replace('.json', ''));

    data.apps.map((app) => ({
      ...app,
      integration: app.integration
        ? {
            ...app.integration,
            properties: app.integration.properties.map((property) => ({
              ...property,
              value: '',
            })),
          }
        : null,
    }));

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
