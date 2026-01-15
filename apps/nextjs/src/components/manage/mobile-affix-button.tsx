import { forwardRef } from "react";
import type { ButtonProps } from "@mantine/core";
import { Affix, Button, createPolymorphicComponent } from "@mantine/core";

type MobileAffixButtonProps = Omit<ButtonProps, "visibleFrom" | "hiddenFrom">;

export const MobileAffixButton = createPolymorphicComponent<"button", MobileAffixButtonProps>(
  forwardRef<HTMLButtonElement, MobileAffixButtonProps>((props, ref) => (
    <>
      <Button ref={ref} visibleFrom="md" {...props} />
      <Affix hiddenFrom="md" position={{ bottom: 20, right: 20 }}>
        <Button ref={ref} {...props} />
      </Affix>
    </>
  )),
);
