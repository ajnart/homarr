"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Switch } from "@mantine/core";
import type { SwitchProps } from "@mantine/core";

import { useI18n } from "@homarr/translation/client";

type ShowAllSwitchProps = Pick<SwitchProps, "defaultChecked">;

export const IncludeFromAllUsersSwitch = ({ defaultChecked }: ShowAllSwitchProps) => {
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const [checked, setChecked] = useState(defaultChecked);
  const t = useI18n();

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
    const params = new URLSearchParams(searchParams);
    params.set("includeFromAllUsers", event.target.checked.toString());
    if (params.has("page")) params.set("page", "1"); // Reset page to 1
    router.replace(`${pathName}?${params.toString()}`);
  };

  return (
    <Switch
      defaultChecked={defaultChecked}
      checked={checked}
      label={t("management.page.media.includeFromAllUsers")}
      onChange={onChange}
    />
  );
};
