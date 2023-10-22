import { z } from 'zod';
import { AppItem } from '~/components/Board/context';
import { appNamePositions, appNameStyles } from '~/server/db/items';

import { commonItemSchema } from './item';

const appUrlRegex =
  '(https?://(?:www.|(?!www))\\[?[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\\]?.[^\\s]{2,}|www.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^\\s]{2,}|https?://(?:www.|(?!www))\\[?[a-zA-Z0-9]+\\]?.[^\\s]{2,}|www.[a-zA-Z0-9]+.[^\\s]{2,})';

const appUrlWithAnyProtocolRegex =
  '([A-z]+://(?:www.|(?!www))\\[?[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\\]?.[^\\s]{2,}|www.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^\\s]{2,}|[A-z]+://(?:www.|(?!www))\\[?[a-zA-Z0-9]+\\]?.[^\\s]{2,}|www.[a-zA-Z0-9]+.[^\\s]{2,})';

export const appFormSchema = z.object({
  id: z.string().nonempty(),
  kind: z.literal('app'),
  name: z.string().min(2).max(64),
  internalUrl: z.string().regex(new RegExp(appUrlRegex)),
  externalUrl: z.string().regex(new RegExp(appUrlWithAnyProtocolRegex)).nullable(),
  iconUrl: z.string().nonempty(),
  nameStyle: z.enum(appNameStyles),
  namePosition: z.enum(appNamePositions),
  nameLineClamp: z.number().min(0).max(10),
  fontSize: z.number().min(5).max(64),
  isPingEnabled: z.boolean(),
  statusCodes: z.array(z.number().min(100).max(999)),
  openInNewTab: z.boolean(),
  description: z.string().nonempty().max(512).nullable(),
});

export const appSchema = appFormSchema.merge(commonItemSchema);
