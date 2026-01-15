"use client";

import type { PropsWithChildren } from "react";
import { useCallback } from "react";
import { usePathname } from "next/navigation";
import type { AccordionProps } from "@mantine/core";
import { Accordion } from "@mantine/core";
import { useShallowEffect } from "@mantine/hooks";

type ActiveTabAccordionProps = PropsWithChildren<Omit<AccordionProps<false>, "onChange">>;

// Replace state without fetchign new data
const replace = (newUrl: string) => {
  window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, "", newUrl);
};

export const ActiveTabAccordion = ({ children, ...props }: ActiveTabAccordionProps) => {
  const pathname = usePathname();
  const onChange = useCallback((tab: string | null) => (tab ? replace(`?tab=${tab}`) : replace(pathname)), [pathname]);

  useShallowEffect(() => {
    if (props.defaultValue) {
      replace(`?tab=${props.defaultValue}`);
    }
  }, [props.defaultValue]);

  return (
    <Accordion {...props} onChange={onChange}>
      {children}
    </Accordion>
  );
};
