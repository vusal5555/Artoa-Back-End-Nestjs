import * as bcrypt from 'bcryptjs';

export const comparePasswords = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
