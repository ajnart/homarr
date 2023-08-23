import { Stack, Stepper } from '@mantine/core';
import { useState } from 'react';

import { StepCreateAccount } from './step-create-account';
import { StepOnboardingFinished } from './step-onboarding-finished';
import { StepUpdatePathMappings } from './step-update-path-mappings';

export const OnboardingSteps = ({ isUpdate }: { isUpdate: boolean }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const nextStep = () => setCurrentStep((current) => (current < 3 ? current + 1 : current));
  const prevStep = () => setCurrentStep((current) => (current > 0 ? current - 1 : current));

  return (
    <Stack p="lg">
      <Stepper
        allowNextStepsSelect={false}
        active={currentStep}
        onStepClick={setCurrentStep}
        breakpoint="sm"
      >
        {isUpdate && (
          <Stepper.Step
            label="Update your installation"
            description="Adjust path mappings and variables"
          >
            <StepUpdatePathMappings next={nextStep} />
          </Stepper.Step>
        )}
        <Stepper.Step label="Your account" description="Create an account">
          <StepCreateAccount next={nextStep} previous={prevStep} />
        </Stepper.Step>
        <Stepper.Completed>
          <StepOnboardingFinished />
        </Stepper.Completed>
      </Stepper>
    </Stack>
  );
};
