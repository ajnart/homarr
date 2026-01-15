import { Box, Select } from "@mantine/core";

import type { Firewall } from "./component";

interface FirewallMenuProps {
  onChange: (value: string | null) => void;
  dropdownItems: Firewall[];
  selectedFirewall: string;
  isTiny: boolean;
}

export const FirewallMenu = ({ onChange, isTiny, dropdownItems, selectedFirewall }: FirewallMenuProps) => (
  <Box>
    <Select
      value={selectedFirewall}
      onChange={onChange}
      size={isTiny ? "8px" : "xs"}
      color="lightgray"
      data={dropdownItems}
      styles={{
        input: {
          minHeight: "24px",
        },
      }}
    />
  </Box>
);
