import type { BadgeProps, MantineSpacing } from "@mantine/core";
import { Badge, Group, Popover, Stack, UnstyledButton } from "@mantine/core";

export function OverflowBadge({
  data,
  overflowCount = 3,
  disablePopover = false,
  groupGap = "xs",
  ...props
}: {
  data: string[];
  overflowCount?: number;
  disablePopover?: boolean;
  groupGap?: MantineSpacing;
} & BadgeProps) {
  const badgeProps = {
    variant: "default",
    size: "lg",
    radius: "sm",
    ...props,
  };
  return (
    <Popover width="content" shadow="md" disabled={disablePopover}>
      <Group gap={groupGap}>
        {data.slice(0, overflowCount).map((item) => (
          <Badge key={item} px="xs" {...badgeProps}>
            {item}
          </Badge>
        ))}
        {data.length > overflowCount && (
          <Popover.Target>
            <UnstyledButton display="flex">
              <Badge px="xs" style={{ cursor: "pointer", ...badgeProps.style }} {...badgeProps}>
                +{data.length - overflowCount}
              </Badge>
            </UnstyledButton>
          </Popover.Target>
        )}
      </Group>
      <Popover.Dropdown>
        <Stack>
          {data.slice(overflowCount).map((item) => (
            <Badge key={item} {...badgeProps}>
              {item}
            </Badge>
          ))}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
