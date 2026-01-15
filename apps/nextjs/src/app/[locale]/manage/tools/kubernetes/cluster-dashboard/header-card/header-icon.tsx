import { IconBrandGit, IconCloudShare, IconGeometry } from "@tabler/icons-react";

import type { HeaderTypes } from "~/app/[locale]/manage/tools/kubernetes/cluster-dashboard/header-card/header-card";

interface HeaderIconProps {
  type: HeaderTypes;
}

export function HeaderIcon({ type }: HeaderIconProps) {
  switch (type) {
    case "providers":
      return <IconCloudShare size={28} stroke={1.5} />;
    case "version":
      return <IconBrandGit size={28} stroke={1.5} />;
    default:
      return <IconGeometry size={28} stroke={1.5} />;
  }
}
