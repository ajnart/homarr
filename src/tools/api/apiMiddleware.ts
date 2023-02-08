export const checkIfAdminUser = async (id: string) => {
  const user = await prisma?.user.findFirst({ where: { id } });
  return user?.isAdmin;
};

export const checkIfOwnerUser = async (id: string) => {
  const user = await prisma?.user.findFirst({ where: { id } });
  return user?.username === 'admin';
};
