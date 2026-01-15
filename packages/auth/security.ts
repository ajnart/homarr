import bcrypt from "bcrypt";

export const createSaltAsync = async () => {
  return bcrypt.genSalt(10);
};

export const hashPasswordAsync = async (password: string, salt: string) => {
  return bcrypt.hash(password, salt);
};
