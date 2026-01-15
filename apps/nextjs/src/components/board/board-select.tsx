import { Group, Text } from "@mantine/core";
import { IconLayoutDashboard } from "@tabler/icons-react";

import type { SelectWithCustomItemsProps } from "@homarr/ui";
import { SelectWithCustomItems } from "@homarr/ui";

import type { Board } from "~/app/[locale]/boards/_types";

interface BoardSelectProps extends Omit<SelectWithCustomItemsProps<{ value: string; label: string }>, "data"> {
  boards: Pick<Board, "id" | "name" | "logoImageUrl">[];
}

export const BoardSelect = ({ boards, ...props }: BoardSelectProps) => {
  return (
    <SelectWithCustomItems
      {...props}
      data={boards.map((board) => ({
        value: board.id,
        label: board.name,
        image: board.logoImageUrl,
      }))}
      SelectOption={({ label, image }: { value: string; label: string; image: string | null }) => (
        <Group>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {image ? <img width={16} height={16} src={image} alt={label} /> : <IconLayoutDashboard size={16} />}
          <Text fz="sm" fw={500}>
            {label}
          </Text>
        </Group>
      )}
    />
  );
};
