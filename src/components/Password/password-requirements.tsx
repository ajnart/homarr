import { Progress } from '@mantine/core';
import { minPasswordLength } from '~/validations/user';

import { PasswordRequirement } from './password-requirement';

const requirements = [
  { re: /[0-9]/, label: 'number' },
  { re: /[a-z]/, label: 'lowercase' },
  { re: /[A-Z]/, label: 'uppercase' },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'special' },
];

function getStrength(password: string) {
  let score = 0;
  const goal = requirements.length + 1;

  requirements.forEach((requirement) => {
    if (requirement.re.test(password)) {
      score += 1;
    }
  });
  if (password.length >= minPasswordLength) {
    score += 1;
  }
  return (score / goal) * 100;
}

export const PasswordRequirements = ({ value }: { value: string }) => {
  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement key={index} label={requirement.label} meets={requirement.re.test(value)} />
  ));

  const strength = getStrength(value);
  const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';
  return (
    <>
      <Progress color={color} value={strength} size={5} mb="xs" />
      <PasswordRequirement label="length" meets={value.length >= minPasswordLength} />
      {checks}
    </>
  );
};
