import { Badge } from "@mantine/core";

import classes from "./count-badge.module.css";

interface CountBadgeProps {
  count: number;
}

export const CountBadge = ({ count }: CountBadgeProps) => {
  return <Badge className={classes.badge}>{count}</Badge>;
};
