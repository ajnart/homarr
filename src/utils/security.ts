import bcrypt from 'bcryptjs';
import { ReactNode } from 'react';

export const hashPassword = (password: string, salt: string) => {
  return bcrypt.hashSync(password, salt);
};

interface ConditionalWrapperProps {
  condition: boolean;
  wrapper: (children: ReactNode) => JSX.Element;
  children: ReactNode;
}

export const ConditionalWrapper: React.FC<ConditionalWrapperProps> = ({ condition, wrapper, children }) =>
  condition ? wrapper(children) : children;