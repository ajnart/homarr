import { Container, Fieldset, Group, Stack, Title } from "@mantine/core";

import { api } from "@homarr/api/server";
import { getIntegrationName } from "@homarr/definitions";
import { getI18n, getScopedI18n } from "@homarr/translation/server";
import { IntegrationAvatar } from "@homarr/ui";

import { DynamicBreadcrumb } from "~/components/navigation/dynamic-breadcrumb";
import { catchTrpcNotFound } from "~/errors/trpc-catch-error";
import { IntegrationAccessSettings } from "../../_components/integration-access-settings";
import { EditIntegrationForm } from "./_integration-edit-form";

interface EditIntegrationPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditIntegrationPage(props: EditIntegrationPageProps) {
  const params = await props.params;
  const editT = await getScopedI18n("integration.page.edit");
  const t = await getI18n();
  const integration = await api.integration.byId({ id: params.id }).catch(catchTrpcNotFound);
  const integrationPermissions = await api.integration.getIntegrationPermissions({ id: integration.id });

  return (
    <>
      <DynamicBreadcrumb dynamicMappings={new Map([[params.id, integration.name]])} nonInteractable={["edit"]} />
      <Container>
        <Stack>
          <Group align="center">
            <IntegrationAvatar kind={integration.kind} size="md" />
            <Title>{editT("title", { name: getIntegrationName(integration.kind) })}</Title>
          </Group>
          <EditIntegrationForm integration={integration} />

          <Title order={2}>{t("permission.title")}</Title>
          <Fieldset>
            <IntegrationAccessSettings integration={integration} initialPermissions={integrationPermissions} />
          </Fieldset>
        </Stack>
      </Container>
    </>
  );
}
