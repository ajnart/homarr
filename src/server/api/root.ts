import { createTRPCRouter } from './trpc';
import { usersRouter } from './routers/users';
import { invitesRouter } from './routers/invites';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: usersRouter,
  invite: invitesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
