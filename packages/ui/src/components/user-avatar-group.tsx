import type { MantineSize } from "@mantine/core";
import { Avatar, AvatarGroup, Tooltip, TooltipGroup } from "@mantine/core";

import type { UserProps } from "./user-avatar";
import { UserAvatar } from "./user-avatar";

interface UserAvatarGroupProps {
  size: MantineSize;
  limit: number;
  users: UserProps[];
}

export const UserAvatarGroup = ({ size, limit, users }: UserAvatarGroupProps) => {
  return (
    <TooltipGroup openDelay={300} closeDelay={300}>
      <AvatarGroup>
        {users.slice(0, limit).map((user) => (
          <Tooltip key={user.name} label={user.name} withArrow>
            <UserAvatar user={user} size={size} />
          </Tooltip>
        ))}
        <MoreUsers size={size} users={users} offset={limit} />
      </AvatarGroup>
    </TooltipGroup>
  );
};

interface MoreUsersProps {
  size: MantineSize;
  users: unknown[];
  offset: number;
}

const MoreUsers = ({ size, users, offset }: MoreUsersProps) => {
  if (users.length <= offset) return null;

  const moreAmount = users.length - offset;

  return (
    <Avatar size={size} radius="xl">
      +{moreAmount}
    </Avatar>
  );
};
