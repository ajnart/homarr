import type { MantineSize } from "@mantine/core";

import { auth } from "@homarr/auth/next";
import { UserAvatar } from "@homarr/ui";

interface CurrentUserAvatarProps {
  size: MantineSize;
}

export const CurrentUserAvatar = async ({ size }: CurrentUserAvatarProps) => {
  const currentSession = await auth();

  return (
    <UserAvatar
      user={{
        name: currentSession?.user.name ?? null,
        image: currentSession?.user.image ?? null,
        email: currentSession?.user.email ?? null,
      }}
      size={size}
    />
  );
};
