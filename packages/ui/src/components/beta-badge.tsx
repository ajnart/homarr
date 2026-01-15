"use client";

import type { BadgeProps } from "@mantine/core";
import { Badge } from "@mantine/core";

import { useTranslations } from "@homarr/translation/client";

interface BetaBadgeProps {
  size: BadgeProps["size"];
}

export const BetaBadge = ({ size }: BetaBadgeProps) => {
  const t = useTranslations();
  return (
    <Badge size={size} color="green" variant="outline">
      {t("common.beta")}
    </Badge>
  );
};
