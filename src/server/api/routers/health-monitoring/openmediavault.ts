import axios from 'axios';
import Consola from 'consola';
import { checkIntegrationsType, findAppProperty } from '~/tools/client/app-properties';
import { getConfig } from '~/tools/config/getConfig';
import { ConfigAppType } from '~/types/app';


let sessionId: string | null = null;
let loginToken: string | null = null;

async function makeOpenMediaVaultRPCCall(
  serviceName: string,
  method: string,
  params: Record<string, any>,
  headers: Record<string, string>,
  input: { configName: string }
) {
  const config = getConfig(input.configName);
  const app = config.apps.find((app) => checkIntegrationsType(app.integration, ['openmediavault']));

  if (!app) {
    Consola.error(`App 'openmediavault' not found for configName '${input.configName}'`);
    return null;
  }

  const appUrl = new URL(app.url);
  const response = await axios.post(
    `${appUrl.origin}/rpc.php`,
    {
      service: serviceName,
      method: method,
      params: params,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }
  );
  return response;
}

export async function makeOpenMediaVaultCalls(app: ConfigAppType, input: any) {
      let authResponse: any = null;

      if (!sessionId || !loginToken) {
        if (!app) {
          Consola.error(
            `Failed to process request to app 'openmediavault'. Please check username & password`
          );
          return null;
        }

        authResponse = await makeOpenMediaVaultRPCCall(
          'session',
          'login',
          {
            username: findAppProperty(app, 'username'),
            password: findAppProperty(app, 'password'),
          },
          {},
          input
        );

        const cookies = authResponse.headers['set-cookie'] || [];
        sessionId = cookies
          .find((cookie: any) => cookie.includes('X-OPENMEDIAVAULT-SESSIONID'))
          ?.split(';')[0];
        loginToken = cookies
          .find((cookie: any) => cookie.includes('X-OPENMEDIAVAULT-LOGIN'))
          ?.split(';')[0];
      }

      const [systemInfoResponse, fileSystemResponse, cpuTempResponse] = await Promise.all([
        makeOpenMediaVaultRPCCall(
          'system',
          'getInformation',
          {},
          { Cookie: `${loginToken};${sessionId}` },
          input
        ),
        makeOpenMediaVaultRPCCall(
          'filesystemmgmt',
          'enumerateMountedFilesystems',
          { includeroot: true },
          { Cookie: `${loginToken};${sessionId}` },
          input
        ),
        makeOpenMediaVaultRPCCall(
          'cputemp',
          'get',
          {},
          { Cookie: `${loginToken};${sessionId}` },
          input
        ),
      ]);

      return {
        authenticated: authResponse ? authResponse.data.response.authenticated : true,
        systemInfo: systemInfoResponse?.data.response,
        fileSystem: fileSystemResponse?.data.response,
        cpuTemp: cpuTempResponse?.data.response,
      };
    }
