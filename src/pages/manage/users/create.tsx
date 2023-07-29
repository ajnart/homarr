import { Stepper } from '@mantine/core';
import { IconMailCheck, IconUser } from '@tabler/icons-react';
import Head from 'next/head';
import { useState } from 'react';
import { MainLayout } from '~/components/layout/admin/main-admin.layout';

const CreateNewUserPage = () => {
  const [active, setActive] = useState(1);
  const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  return (
    <MainLayout>
      <Head>
        <title>Create user • Homarr</title>
      </Head>

      <Stepper active={active} onStepClick={setActive} breakpoint="sm">
        <Stepper.Step
          allowStepClick={false}
          allowStepSelect={false}
          icon={<IconUser />}
          label="First step"
          description="Create an account"
        >
          Step 1 content: Create an account
        </Stepper.Step>
        <Stepper.Step
          allowStepClick={false}
          allowStepSelect={false}
          icon={<IconMailCheck />}
          label="Second step"
          description="Verify email"
        >
          Step 2 content: Verify email
        </Stepper.Step>
        <Stepper.Step
          allowStepClick={false}
          allowStepSelect={false}
          icon={<IconUser />}
          label="Final step"
          description="Get full access"
        >
          Step 3 content: Get full access
        </Stepper.Step>
        <Stepper.Completed>Completed, click back button to get to previous step</Stepper.Completed>
      </Stepper>
    </MainLayout>
  );
};

export default CreateNewUserPage;
