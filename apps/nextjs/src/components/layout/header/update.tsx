"use client";

import type { PropsWithChildren } from "react";
import { Suspense, use } from "react";
import { Indicator, Menu, Text } from "@mantine/core";
import { IconBellRinging } from "@tabler/icons-react";

import type { RouterOutputs } from "@homarr/api";
import { useScopedI18n } from "@homarr/translation/client";

interface UpdateIndicatorProps extends PropsWithChildren {
  availableUpdatesPromise: Promise<RouterOutputs["updateChecker"]["getAvailableUpdates"]> | undefined;
  disabled: boolean;
}

export const UpdateIndicator = ({ children, availableUpdatesPromise, disabled }: UpdateIndicatorProps) => {
  if (disabled || availableUpdatesPromise === undefined) {
    return children;
  }

  return (
    <Suspense fallback={children}>
      <InnerUpdateIndicator availableUpdatesPromise={availableUpdatesPromise} disabled={disabled}>
        {children}
      </InnerUpdateIndicator>
    </Suspense>
  );
};

interface InnerUpdateIndicatorProps extends PropsWithChildren {
  availableUpdatesPromise: Promise<RouterOutputs["updateChecker"]["getAvailableUpdates"]>;
  disabled: boolean;
}

const InnerUpdateIndicator = ({ children, disabled, availableUpdatesPromise }: InnerUpdateIndicatorProps) => {
  const availableUpdates = use(availableUpdatesPromise);

  return (
    <Indicator
      disabled={!availableUpdates || availableUpdates.length === 0 || disabled}
      size={15}
      processing
      withBorder
    >
      {children}
    </Indicator>
  );
};

interface AvailableUpdatesMenuItemProps {
  availableUpdatesPromise: Promise<RouterOutputs["updateChecker"]["getAvailableUpdates"]> | undefined;
}

export const AvailableUpdatesMenuItem = ({ availableUpdatesPromise }: AvailableUpdatesMenuItemProps) => {
  if (availableUpdatesPromise === undefined) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <InnerAvailableUpdatesMenuItem availableUpdatesPromise={availableUpdatesPromise} />
    </Suspense>
  );
};

interface InnerAvailableUpdatesMenuItemProps {
  availableUpdatesPromise: Promise<RouterOutputs["updateChecker"]["getAvailableUpdates"]>;
}

const InnerAvailableUpdatesMenuItem = ({ availableUpdatesPromise }: InnerAvailableUpdatesMenuItemProps) => {
  const t = useScopedI18n("common.userAvatar.menu");
  const availableUpdates = use(availableUpdatesPromise);
  if (availableUpdates === undefined || availableUpdates.length === 0) {
    return null;
  }

  const latestUpdate = availableUpdates.at(0);
  if (!latestUpdate) return null;

  return (
    <>
      <Menu.Item component={"a"} href={latestUpdate.url} target="_blank" leftSection={<IconBellRinging size="1rem" />}>
        <Text fw="bold" size="sm">
          {t("updateAvailable", {
            countUpdates: String(availableUpdates.length),
            tag: latestUpdate.tagName,
          })}
        </Text>
      </Menu.Item>
      <Menu.Divider />
    </>
  );
};
