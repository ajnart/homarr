import { Card } from "@mantine/core";

import { InitUserForm } from "./init-user-form";

export const InitUser = () => {
  return (
    <Card w={64 * 6} maw="90vw" withBorder>
      <InitUserForm />
    </Card>
  );
};
