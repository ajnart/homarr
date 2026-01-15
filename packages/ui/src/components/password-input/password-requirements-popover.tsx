import type { PropsWithChildren } from "react";
import { useState } from "react";
import { Popover, Progress } from "@mantine/core";

import { useScopedI18n } from "@homarr/translation/client";
import { passwordRequirements } from "@homarr/validation/user";

import { PasswordRequirement } from "./password-requirement";

export const PasswordRequirementsPopover = ({ password, children }: PropsWithChildren<{ password: string }>) => {
  const requirements = useRequirements();
  const strength = useStrength(password);
  const [popoverOpened, setPopoverOpened] = useState(false);
  const checks = (
    <>
      {requirements.map((requirement) => (
        <PasswordRequirement key={requirement.label} label={requirement.label} meets={requirement.check(password)} />
      ))}
    </>
  );

  const color = strength === 100 ? "teal" : strength > 50 ? "yellow" : "red";

  return (
    <Popover opened={popoverOpened} position="bottom" width="target" transitionProps={{ transition: "pop" }}>
      <Popover.Target>
        <div onFocusCapture={() => setPopoverOpened(true)} onBlurCapture={() => setPopoverOpened(false)}>
          {children}
        </div>
      </Popover.Target>
      <Popover.Dropdown>
        <Progress color={color} value={strength} size={5} mb="xs" />
        {checks}
      </Popover.Dropdown>
    </Popover>
  );
};

const useRequirements = () => {
  const t = useScopedI18n("user.field.password.requirement");

  return passwordRequirements.map(({ check, value }) => ({ check, label: t(value) }));
};

function useStrength(password: string) {
  const requirements = useRequirements();

  return (100 / requirements.length) * requirements.filter(({ check }) => check(password)).length;
}
