import { Fragment } from "react";
import type { PropsWithChildren } from "react";
import { redirect } from "next/navigation";
import {
  AccordionControl,
  AccordionItem,
  AccordionPanel,
  ActionIcon,
  ActionIconGroup,
  Affix,
  Anchor,
  Box,
  Button,
  Divider,
  Group,
  Menu,
  MenuDropdown,
  MenuTarget,
  Stack,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  Title,
} from "@mantine/core";
import { IconChevronDown, IconChevronUp, IconPencil, IconPlugX } from "@tabler/icons-react";

import type { RouterOutputs } from "@homarr/api";
import { api } from "@homarr/api/server";
import { auth } from "@homarr/auth/next";
import { objectEntries } from "@homarr/common";
import type { IntegrationKind } from "@homarr/definitions";
import { getIntegrationName } from "@homarr/definitions";
import { getScopedI18n } from "@homarr/translation/server";
import { CountBadge, IntegrationAvatar, Link } from "@homarr/ui";

import { ManageContainer } from "~/components/manage/manage-container";
import { DynamicBreadcrumb } from "~/components/navigation/dynamic-breadcrumb";
import { NoResults } from "~/components/no-results";
import { env } from "~/env";
import { ActiveTabAccordion } from "../../../../components/active-tab-accordion";
import { DeleteIntegrationActionButton } from "./_integration-buttons";
import { IntegrationCreateDropdownContent } from "./new/_integration-new-dropdown";
import classes from "./page.module.css";

interface IntegrationsPageProps {
  searchParams: Promise<{
    tab?: IntegrationKind;
  }>;
}

export default async function IntegrationsPage(props: IntegrationsPageProps) {
  const searchParams = await props.searchParams;
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  const integrations = await api.integration.all();
  const t = await getScopedI18n("integration");

  const canCreateIntegrations = session.user.permissions.includes("integration-create");

  return (
    <ManageContainer>
      <DynamicBreadcrumb />
      <Stack>
        <Group justify="space-between" align="center">
          <Title>{t("page.list.title")}</Title>

          {canCreateIntegrations && (
            <>
              <Box>
                <IntegrationSelectMenu>
                  <Affix hiddenFrom="md" position={{ bottom: 20, right: 20 }}>
                    <MenuTarget>
                      <Button rightSection={<IconChevronUp size={16} stroke={1.5} />}>{t("action.create")}</Button>
                    </MenuTarget>
                  </Affix>
                </IntegrationSelectMenu>
              </Box>

              <Box visibleFrom="md">
                <IntegrationSelectMenu>
                  <MenuTarget>
                    <Button rightSection={<IconChevronDown size={16} stroke={1.5} />}>{t("action.create")}</Button>
                  </MenuTarget>
                </IntegrationSelectMenu>
              </Box>
            </>
          )}
        </Group>

        <IntegrationList integrations={integrations} activeTab={searchParams.tab} />
      </Stack>
    </ManageContainer>
  );
}

const IntegrationSelectMenu = ({ children }: PropsWithChildren) => {
  return (
    <Menu
      width={256}
      trapFocus
      position="bottom-end"
      withinPortal
      shadow="md"
      keepMounted={false}
      withInitialFocusPlaceholder={false}
    >
      {children}
      <MenuDropdown>
        <IntegrationCreateDropdownContent enableMockIntegration={env.UNSAFE_ENABLE_MOCK_INTEGRATION} />
      </MenuDropdown>
    </Menu>
  );
};

interface IntegrationListProps {
  integrations: RouterOutputs["integration"]["all"];
  activeTab?: IntegrationKind;
}

const IntegrationList = async ({ integrations, activeTab }: IntegrationListProps) => {
  const t = await getScopedI18n("integration");
  const session = await auth();
  const hasFullAccess = session?.user.permissions.includes("integration-full-all") ?? false;

  if (integrations.length === 0) {
    return <NoResults icon={IconPlugX} title={t("page.list.noResults.title")} />;
  }

  const groupedIntegrations = integrations.reduce(
    (acc, integration) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!acc[integration.kind]) {
        acc[integration.kind] = [];
      }

      acc[integration.kind].push(integration);

      return acc;
    },
    {} as Record<IntegrationKind, RouterOutputs["integration"]["all"]>,
  );

  const entries = objectEntries(groupedIntegrations);

  return (
    <ActiveTabAccordion defaultValue={activeTab} radius="lg" classNames={classes}>
      {entries.map(([kind, integrations], index) => (
        <AccordionItem key={kind} value={kind} data-first={index === 0} data-last={index === entries.length - 1}>
          <AccordionControl icon={<IntegrationAvatar size="sm" kind={kind} radius="sm" />}>
            <Group>
              <Text>{getIntegrationName(kind)}</Text>
              <CountBadge count={integrations.length} />
            </Group>
          </AccordionControl>
          <AccordionPanel>
            <Table visibleFrom="md">
              <TableThead>
                <TableTr>
                  <TableTh>{t("field.name.label")}</TableTh>
                  <TableTh>{t("field.url.label")}</TableTh>
                  <TableTh />
                </TableTr>
              </TableThead>
              <TableTbody>
                {integrations.map((integration) => (
                  <TableTr key={integration.id}>
                    <TableTd>{integration.name}</TableTd>
                    <TableTd>
                      <Anchor href={integration.url} target="_blank" rel="noreferrer" size="sm">
                        {integration.url}
                      </Anchor>
                    </TableTd>
                    <TableTd>
                      <Group justify="end">
                        {(hasFullAccess || integration.permissions.hasFullAccess) && (
                          <ActionIconGroup>
                            <ActionIcon
                              component={Link}
                              href={`/manage/integrations/edit/${integration.id}`}
                              variant="subtle"
                              color="gray"
                              aria-label={t("page.edit.title", { name: getIntegrationName(integration.kind) })}
                            >
                              <IconPencil size={16} stroke={1.5} />
                            </ActionIcon>
                            <DeleteIntegrationActionButton integration={integration} count={integrations.length} />
                          </ActionIconGroup>
                        )}
                      </Group>
                    </TableTd>
                  </TableTr>
                ))}
              </TableTbody>
            </Table>

            <Stack gap="xs" hiddenFrom="md">
              {integrations.map((integration, index) => (
                <Fragment key={integration.id}>
                  {index !== 0 && <Divider />}
                  <Stack gap={0}>
                    <Group justify="space-between" align="center" wrap="nowrap">
                      <Text>{integration.name}</Text>
                      {(hasFullAccess || integration.permissions.hasFullAccess) && (
                        <ActionIconGroup>
                          <ActionIcon
                            component={Link}
                            href={`/manage/integrations/edit/${integration.id}`}
                            variant="subtle"
                            color="gray"
                            aria-label={t("page.edit.title", { name: getIntegrationName(integration.kind) })}
                          >
                            <IconPencil size={16} stroke={1.5} />
                          </ActionIcon>
                          <DeleteIntegrationActionButton integration={integration} count={integrations.length} />
                        </ActionIconGroup>
                      )}
                    </Group>
                    <Anchor href={integration.url} target="_blank" rel="noreferrer" size="sm">
                      {integration.url}
                    </Anchor>
                  </Stack>
                </Fragment>
              ))}
            </Stack>
          </AccordionPanel>
        </AccordionItem>
      ))}
    </ActiveTabAccordion>
  );
};
