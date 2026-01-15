"use client";

import type { PropsWithChildren, ReactNode } from "react";
import { Button } from "@mantine/core";

import { clientApi } from "@homarr/api/client";
import { revalidatePathActionAsync } from "@homarr/common/client";
import type { OnboardingStep } from "@homarr/definitions";

interface InitStartButtonProps {
  icon: ReactNode;
  preferredStep: OnboardingStep | undefined;
}

export const InitStartButton = ({ preferredStep, icon, children }: PropsWithChildren<InitStartButtonProps>) => {
  const { mutateAsync } = clientApi.onboard.nextStep.useMutation();

  const handleClickAsync = async () => {
    await mutateAsync({ preferredStep });
    await revalidatePathActionAsync("/init");
  };

  return (
    <Button onClick={handleClickAsync} variant="default" leftSection={icon}>
      {children}
    </Button>
  );
};
