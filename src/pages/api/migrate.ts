import AdmZip from 'adm-zip';
import crypto, { randomBytes } from 'crypto';
import { eq, isNotNull } from 'drizzle-orm';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';
import { migrateTokens, users } from '~/server/db/schema';
import { getConfig } from '~/tools/config/getConfig';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerAuthSession({ req, res });
  if (!session) {
    return res.status(401).end();
  }

  if (!session.user.isAdmin) {
    return res.status(403).end('Not an admin');
  }

  const token = req.query.token;

  if (!token || Array.isArray(token)) {
    return res.status(400).end();
  }

  const dbToken = await db.query.migrateTokens.findFirst({
    where: eq(migrateTokens.token, token),
  });

  if (!dbToken) {
    return res.status(403).end('No db token');
  }

  if (dbToken.expires < new Date()) {
    return res.status(403).end('Token expired');
  }

  const files = fs.readdirSync('./data/configs').filter((file) => file.endsWith('.json'));

  const zip = new AdmZip();

  for (const file of files) {
    const data = await getConfig(file.replace('.json', ''));

    const mappedApps = data.apps.map((app) => ({
      ...app,
      integration:
        app.integration && dbToken.integrations
          ? {
              ...app.integration,
              properties: app.integration.properties.map((property) => ({
                ...property,
                value: property.value ? encryptSecret(property.value, dbToken.token) : null,
              })),
            }
          : null,
    }));

    const content = JSON.stringify(
      {
        ...data,
        apps: mappedApps,
      },
      null,
      2
    );
    zip.addFile(file, Buffer.from(content, 'utf-8'));
  }

  if (dbToken.users) {
    // Only credentials users
    const dbUsers = await db.query.users.findMany({
      with: { settings: true },
      where: isNotNull(users.password),
    });
    const encryptedUsers = dbUsers.map((user) => ({
      ...user,
      password: user.password ? encryptSecret(user.password, dbToken.token) : null,
      salt: user.salt ? encryptSecret(user.salt, dbToken.token) : null,
    }));
    const content = JSON.stringify(encryptedUsers, null, 2);
    zip.addFile('users/users.json', Buffer.from(content, 'utf-8'));
  }

  if (dbToken.integrations || dbToken.users) {
    const checksum = randomBytes(16).toString('hex');
    const encryptedChecksum = encryptSecret(checksum, dbToken.token);
    const content = `${checksum}\n${encryptedChecksum}`;
    zip.addFile('checksum.txt', Buffer.from(content, 'utf-8'));
  }

  const zipBuffer = zip.toBuffer();
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename=migrate-homarr.zip');
  res.setHeader('Content-Length', zipBuffer.length.toString());
  res.status(200).end(zipBuffer);
};

export default handler;

export function encryptSecret(text: string, encryptionKey: string): `${string}.${string}` {
  const key = Buffer.from(encryptionKey, 'hex');
  const initializationVector = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), initializationVector);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${encrypted.toString('hex')}.${initializationVector.toString('hex')}`;
}
