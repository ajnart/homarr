import bcrypt from "bcrypt";

export const hashPassword = (password: string, salt: string) => {
  return bcrypt.hashSync(password, salt);
};
