import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import type { Session } from "@homarr/auth";
import { hasQueryAccessToIntegrationsAsync } from "@homarr/auth/server";
import { constructIntegrationPermissions } from "@homarr/auth/shared";
import { decryptSecret } from "@homarr/common/server";
import type { AtLeastOneOf } from "@homarr/common/types";
import type { Database } from "@homarr/db";
import { and, eq, inArray } from "@homarr/db";
import { integrations } from "@homarr/db/schema";
import type { IntegrationKind } from "@homarr/definitions";

import { publicProcedure } from "../trpc";

export type IntegrationAction = "query" | "interact";

/**
 * Creates a middleware that provides the integration in the context that is of the specified kinds
 * @param action query for showing data or interact for mutating data
 * @param kinds kinds of integrations that are supported
 * @returns middleware that can be used with trpc
 * @example publicProcedure.concat(createOneIntegrationMiddleware("query", "piHole", "homeAssistant")).query(...)
 * @throws TRPCError NOT_FOUND if the integration was not found
 * @throws TRPCError FORBIDDEN if the user does not have permission to perform the specified action on the specified integration
 */
export const createOneIntegrationMiddleware = <TKind extends IntegrationKind>(
  action: IntegrationAction,
  ...kinds: AtLeastOneOf<TKind> // Ensure at least one kind is provided
) => {
  return publicProcedure.input(z.object({ integrationId: z.string() })).use(async ({ input, ctx, next }) => {
    const integration = await ctx.db.query.integrations.findFirst({
      where: and(eq(integrations.id, input.integrationId), inArray(integrations.kind, kinds)),
      with: {
        app: true,
        secrets: true,
        groupPermissions: true,
        userPermissions: true,
        items: {
          with: {
            item: true,
          },
        },
      },
    });

    if (!integration) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Integration with id ${input.integrationId} not found or not of kinds ${kinds.join(",")}`,
      });
    }

    await throwIfActionIsNotAllowedAsync(action, ctx.db, [integration], ctx.session);

    const {
      secrets,
      kind,
      items: _ignore1,
      groupPermissions: _ignore2,
      userPermissions: _ignore3,
      ...rest
    } = integration;

    return next({
      ctx: {
        integration: {
          ...rest,
          externalUrl: rest.app?.href ?? null,
          kind: kind as TKind,
          decryptedSecrets: secrets.map((secret) => ({
            ...secret,
            value: decryptSecret(secret.value),
          })),
        },
      },
    });
  });
};

/**
 * Creates a middleware that provides the integrations in the context that are of the specified kinds and have the specified item
 * It also ensures that the user has permission to perform the specified action on the integrations
 * @param action query for showing data or interact for mutating data
 * @param kinds kinds of integrations that are supported
 * @returns middleware that can be used with trpc
 * @example publicProcedure.concat(createManyIntegrationMiddleware("query", "piHole", "homeAssistant")).query(...)
 * @throws TRPCError NOT_FOUND if the integration was not found
 * @throws TRPCError FORBIDDEN if the user does not have permission to perform the specified action on at least one of the specified integrations
 */
export const createManyIntegrationMiddleware = <TKind extends IntegrationKind>(
  action: IntegrationAction,
  ...kinds: AtLeastOneOf<TKind> // Ensure at least one kind is provided
) => {
  return publicProcedure.input(z.object({ integrationIds: z.array(z.string()) })).use(async ({ ctx, input, next }) => {
    const dbIntegrations =
      input.integrationIds.length >= 1
        ? await ctx.db.query.integrations.findMany({
            where: and(inArray(integrations.id, input.integrationIds), inArray(integrations.kind, kinds)),
            with: {
              app: true,
              secrets: true,
              items: {
                with: {
                  item: true,
                },
              },
              userPermissions: true,
              groupPermissions: true,
            },
          })
        : [];

    const offset = input.integrationIds.length - dbIntegrations.length;
    if (offset !== 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `${offset} of the specified integrations not found or not of kinds ${kinds.join(",")}: ([${input.integrationIds.join(",")}] compared to [${dbIntegrations.map(({ id, kind }) => `${kind}:${id}`).join(",")}])`,
      });
    }

    if (dbIntegrations.length >= 1) {
      await throwIfActionIsNotAllowedAsync(action, ctx.db, dbIntegrations, ctx.session);
    }

    return next({
      ctx: {
        integrations: dbIntegrations.map(
          ({ secrets, kind, items: _ignore1, groupPermissions: _ignore2, userPermissions: _ignore3, ...rest }) => ({
            ...rest,
            externalUrl: rest.app?.href ?? null,
            kind: kind as TKind,
            decryptedSecrets: secrets.map((secret) => ({
              ...secret,
              value: decryptSecret(secret.value),
            })),
          }),
        ),
      },
    });
  });
};

/**
 * Throws a TRPCError FORBIDDEN if the user does not have permission to perform the specified action on at least one of the specified integrations
 * @param action action to perform
 * @param db db instance
 * @param integrations integrations to check permissions for
 * @param session session of the user
 * @throws TRPCError FORBIDDEN if the user does not have permission to perform the specified action on at least one of the specified integrations
 */
const throwIfActionIsNotAllowedAsync = async (
  action: IntegrationAction,
  db: Database,
  integrations: Parameters<typeof hasQueryAccessToIntegrationsAsync>[1],
  session: Session | null,
) => {
  if (action === "interact") {
    const haveAllInteractAccess = integrations
      .map((integration) => constructIntegrationPermissions(integration, session))
      .every(({ hasInteractAccess }) => hasInteractAccess);
    if (haveAllInteractAccess) return;

    throw new TRPCError({
      code: "FORBIDDEN",
      message: "User does not have permission to interact with at least one of the specified integrations",
    });
  }

  const hasQueryAccess = await hasQueryAccessToIntegrationsAsync(db, integrations, session);

  if (hasQueryAccess) return;

  throw new TRPCError({
    code: "FORBIDDEN",
    message: "User does not have permission to query at least one of the specified integration",
  });
};
