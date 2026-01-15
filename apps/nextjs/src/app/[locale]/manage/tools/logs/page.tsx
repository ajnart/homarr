import { Box, Group } from "@mantine/core";

import { getScopedI18n } from "@homarr/translation/server";

import "@xterm/xterm/css/xterm.css";

import { notFound } from "next/navigation";

import { auth } from "@homarr/auth/next";
import { logsEnv } from "@homarr/core/infrastructure/logs/env";

import { DynamicBreadcrumb } from "~/components/navigation/dynamic-breadcrumb";
import { fullHeightWithoutHeaderAndFooter } from "~/constants";
import { createMetaTitle } from "~/metadata";
import { ClientSideTerminalComponent } from "./client";
import { LogLevelSelection } from "./level-selection";
import { LogContextProvider } from "./log-context";

export async function generateMetadata() {
  const session = await auth();
  if (!session?.user || !session.user.permissions.includes("admin")) {
    return {};
  }
  const t = await getScopedI18n("management");

  return {
    title: createMetaTitle(t("metaTitle")),
  };
}

export default async function LogsManagementPage() {
  const session = await auth();
  if (!session?.user || !session.user.permissions.includes("other-view-logs")) {
    notFound();
  }

  return (
    <LogContextProvider defaultLevel={logsEnv.LEVEL}>
      <Group justify="space-between" align="center" wrap="nowrap">
        <DynamicBreadcrumb />
        <LogLevelSelection />
      </Group>
      <Box style={{ borderRadius: 6 }} h={fullHeightWithoutHeaderAndFooter} p="md" bg="black">
        <ClientSideTerminalComponent />
      </Box>
    </LogContextProvider>
  );
}
