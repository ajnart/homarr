import type { PropsWithChildren } from "react";
import type { MantineSize } from "@mantine/core";
import { Container } from "@mantine/core";

export const ManageContainer = ({ children, size }: PropsWithChildren<{ size?: MantineSize }>) => {
  return (
    <Container size={size} px={{ base: "0 !important", md: "var(--mantine-spacing-md) !important" }}>
      {children}
    </Container>
  );
};
