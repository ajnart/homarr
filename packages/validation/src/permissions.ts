import { z } from "zod/v4";

export const createSavePermissionsSchema = <const TPermissionSchema extends z.core.$ZodEnum>(
  permissionSchema: TPermissionSchema,
) => {
  return z.object({
    entityId: z.string(),
    permissions: z.array(
      z.object({
        principalId: z.string(),
        permission: permissionSchema,
      }),
    ),
  });
};
