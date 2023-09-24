import bcrypt from 'bcryptjs';

export const hashPassword = (password: string, salt: string) => {
  return bcrypt.hashSync(password, salt);
};
