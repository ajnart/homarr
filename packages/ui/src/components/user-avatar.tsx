"use client";

import type { AvatarProps } from "@mantine/core";
import { Avatar } from "@mantine/core";
import { enc, MD5 } from "crypto-js";

import { useSettings } from "@homarr/settings";

export interface UserProps {
  name: string | null;
  image: string | null;
  email: string | null;
}

interface UserAvatarProps {
  user: UserProps | null;
  size: AvatarProps["size"];
}

export const UserAvatar = ({ user, size }: UserAvatarProps) => {
  const { enableGravatar } = useSettings();

  if (!user?.name) return <Avatar size={size} />;

  if (user.image) {
    return <Avatar src={user.image} alt={user.name} size={size} />;
  }

  if (user.email && enableGravatar) {
    const emailHash = MD5(user.email.trim().toLowerCase()).toString(enc.Hex);
    return <Avatar src={`https://seccdn.libravatar.org/avatar/${emailHash}?d=blank`} alt={user.name} size={size} />;
  }

  return <Avatar name={user.name} color="initials" size={size}></Avatar>;
};
