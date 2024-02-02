import axios from 'axios';
import Consola from 'consola';
import { z } from 'zod';
import { checkIntegrationsType, findAppProperty } from '~/tools/client/app-properties';
import { getConfig } from '~/tools/config/getConfig';

import { createTRPCRouter, protectedProcedure } from '../trpc';

let sessionId: any = '';
let loginToken: any = '';

export const openmediavaultRouter = createTRPCRouter({
  auth: protectedProcedure
    .input(
      z.object({
        configName: z.string(),
      })
    )
    .query(async ({ input }) => {
      const config = getConfig(input.configName);
      const app = config.apps.find((app) =>
        checkIntegrationsType(app.integration, ['openmediavault'])
      );

      const username = findAppProperty(app, 'username');
      const password = findAppProperty(app, 'password');

      if (!app || !username || !password) {
        Consola.error(
          `failed to process request to app '${app?.integration}' (${app?.id}). Please check username & password`
        );
      }

      const appUrl = new URL(app.url);
      const authResponse = await axios.post(
        `${appUrl.origin}/rpc.php`,
        {
          service: 'session',
          method: 'login',
          params: {
            username: username,
            password: password,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const cookies = authResponse.headers['set-cookie'] || [];
      sessionId = cookies
        .find((cookie: any) => cookie.includes('X-OPENMEDIAVAULT-SESSIONID'))
        ?.split(';')[0];
      loginToken = cookies
        .find((cookie: any) => cookie.includes('X-OPENMEDIAVAULT-LOGIN'))
        ?.split(';')[0];

      return authResponse.data.response.authenticated;
    }),

  systemInfo: protectedProcedure
    .input(
      z.object({
        configName: z.string(),
      })
    )
    .query(async ({ input }) => {
      const config = getConfig(input.configName);
      const app = config.apps.find((app) =>
        checkIntegrationsType(app.integration, ['openmediavault'])
      );

      if (!app) {
        Consola.error(`App not found for configName '${input.configName}'`);
        return null;
      }

      const appUrl = new URL(app.url);
      const systemInfoResponse = await axios.post(
        `${appUrl.origin}/rpc.php`,
        {
          service: 'system',
          method: 'getInformation',
          params: {},
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Cookie: `${loginToken};${sessionId}`,
          },
        }
      );
      return systemInfoResponse.data.response;
    }),

  fileSystem: protectedProcedure
    .input(
      z.object({
        configName: z.string(),
      })
    )
    .query(async ({ input }) => {
      const config = getConfig(input.configName);
      const app = config.apps.find((app) =>
        checkIntegrationsType(app.integration, ['openmediavault'])
      );

      if (!app) {
        Consola.error(`App not found for configName '${input.configName}'`);
        return null;
      }

      const appUrl = new URL(app.url);
      const fileSystemResponse = await axios.post(
        `${appUrl.origin}/rpc.php`,
        {
          service: 'filesystemmgmt',
          method: 'enumerateMountedFilesystems',
          params: {
            includeroot: true,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Cookie: `${loginToken};${sessionId}`,
          },
        }
      );
      return fileSystemResponse.data.response;
    }),

  cpuTemp: protectedProcedure
    .input(
      z.object({
        configName: z.string(),
      })
    )
    .query(async ({ input }) => {
      const config = getConfig(input.configName);
      const app = config.apps.find((app) =>
        checkIntegrationsType(app.integration, ['openmediavault'])
      );

      if (!app) {
        Consola.error(`App not found for configName '${input.configName}'`);
        return null;
      }

      const appUrl = new URL(app.url);
      const cpuTempResponse = await axios.post(
        `${appUrl.origin}/rpc.php`,
        {
          service: 'cputemp',
          method: 'get',
          params: {},
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Cookie: `${loginToken};${sessionId}`,
          },
        }
      );
      return cpuTempResponse.data.response;
    }),
});
