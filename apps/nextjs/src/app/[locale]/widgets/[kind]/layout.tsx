import type { PropsWithChildren } from "react";

import { widgetImports } from "@homarr/widgets";

import { MainNavigation } from "~/components/layout/navigation";
import { ClientShell } from "~/components/layout/shell";

const getLinks = () => {
  return Object.entries(widgetImports).map(([key, value]) => {
    return {
      href: `/widgets/${key}`,
      icon: value.definition.icon,
      label: value.definition.kind,
    };
  });
};

export default function WidgetPreviewLayout({ children }: PropsWithChildren) {
  const links = getLinks();

  return (
    <ClientShell hasHeader={false}>
      <MainNavigation links={links} />
      {children}
    </ClientShell>
  );
}
