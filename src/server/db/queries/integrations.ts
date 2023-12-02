import { and, eq, inArray } from 'drizzle-orm';
import { User } from 'next-auth';

import { db } from '..';
import { IntegrationSecretKey, IntegrationType } from '../items';
import { boards, integrations, items } from '../schema';

export async function getIntegrations<TIntegrations extends IntegrationType>(
  boardId: string,
  sorts: TIntegrations[],
  user: User | null | undefined
) {
  return await getIntegrationsForWidget(boardId, sorts, user, 'ignore');
}

export const getIntegrationsForWidget = async <TIntegrations extends IntegrationType>(
  boardId: string,
  types: TIntegrations[],

  user: User | null | undefined,
  widgetId: 'ignore' | (string & {})
) => {
  const widgetItems = await db.query.items.findMany({
    where: and(
      eq(items.boardId, boardId),
      user ? undefined : eq(boards.allowGuests, true),
      types.length >= 1 ? inArray(integrations.type, types) : undefined,
      widgetId !== 'ignore' ? eq(items.id, widgetId) : undefined
    ),
    with: {
      widget: {
        with: {
          integrations: {
            with: {
              integration: {
                with: {
                  secrets: true,
                },
              },
            },
          },
          options: true,
        },
      },
    },
  });
  return widgetItems
    .flatMap((x) => x.widget?.integrations ?? [])
    .map((x) => ({ ...x.integration, type: x.integration.type as TIntegrations }));
};

export async function getIntegrationAsync(integrationId: string) {
  return await db.query.integrations.findFirst({
    where: eq(integrations.id, integrationId),
    with: {
      secrets: true,
      widgets: true,
    },
  });
}

export function getSecret(
  integration: Awaited<ReturnType<typeof getIntegrations>>[number],
  key: IntegrationSecretKey
) {
  return integration.secrets.find((s) => s.key === key)?.value ?? '';
}
