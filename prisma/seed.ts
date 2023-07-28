import { prisma } from '~/db/client';

import { defaultConfigExample } from '../data/configs/defaultConfigExample';

async function main() {
  const configProperty = await prisma.configProperty.upsert({
    where: { name: defaultConfigExample.configProperties.name },
    update: {},
    create: {
      name: defaultConfigExample.configProperties.name,
      id: defaultConfigExample.configProperties.name,
    },
  });

  console.log({ configProperty });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
