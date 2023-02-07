const prismaModule = require('@prisma/client');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;
const ADMIN_USERNAME = 'admin';

const client = new prismaModule.PrismaClient();
async function main() {
  console.log('[Homarr]: Resetting admin password...');
  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, salt);

  await client.user.upsert({
    where: { username: ADMIN_USERNAME },
    update: {
      password: hash,
      isAdmin: true,
      isEnabled: true,
    },
    create: {
      username: ADMIN_USERNAME,
      password: hash,
      isAdmin: true,
    },
  });
  console.log('[Homarr]: Admin password reset was successfull');
}
main()
  .then(async () => {
    await client.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await client.$disconnect();
    process.exit(1);
  });

module.exports = {};
