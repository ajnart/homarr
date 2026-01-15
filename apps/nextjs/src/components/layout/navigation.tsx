import type { JSX } from "react";
import { AppShellNavbar, AppShellSection, Image, ScrollArea } from "@mantine/core";

import type { TablerIcon, TablerIconProps } from "@homarr/ui";

import type { ClientNavigationLink } from "./navigation-link";
import { CommonNavLink } from "./navigation-link";

interface MainNavigationProps {
  headerSection?: JSX.Element;
  footerSection?: JSX.Element;
  links: NavigationLink[];
}

export const MainNavigation = ({ headerSection, footerSection, links }: MainNavigationProps) => {
  return (
    <AppShellNavbar p="md">
      {headerSection && <AppShellSection>{headerSection}</AppShellSection>}
      <AppShellSection
        grow
        mt={headerSection ? "md" : undefined}
        mb={footerSection ? "md" : undefined}
        component={ScrollArea}
      >
        {links.map((link, index) => {
          if (link.hidden) {
            return null;
          }

          const { icon: TablerIcon, iconProps, ...props } = link;
          const Icon =
            typeof TablerIcon === "string" ? (
              <Image src={TablerIcon} w={20} h={20} />
            ) : (
              <TablerIcon size={20} stroke={1.5} {...iconProps} />
            );
          let clientLink: ClientNavigationLink;
          if ("items" in props) {
            clientLink = {
              ...props,
              items: props.items
                .filter((item) => !item.hidden)
                .map((item) => {
                  return {
                    ...item,
                    icon: <item.icon size={20} stroke={1.5} {...iconProps} />,
                  };
                }),
            } as ClientNavigationLink;
          } else {
            clientLink = props as ClientNavigationLink;
          }
          return <CommonNavLink key={index} {...clientLink} icon={Icon} />;
        })}
      </AppShellSection>
      {footerSection && <AppShellSection>{footerSection}</AppShellSection>}
    </AppShellNavbar>
  );
};

interface CommonNavigationLinkProps {
  label: string;
  icon: TablerIcon | string;
  iconProps?: TablerIconProps;
  hidden?: boolean;
}

interface NavigationLinkHref extends CommonNavigationLinkProps {
  href: string;
  external?: boolean;
}
interface NavigationLinkWithItems extends CommonNavigationLinkProps {
  items: NavigationLinkHref[];
}

export type NavigationLink = NavigationLinkHref | NavigationLinkWithItems;
