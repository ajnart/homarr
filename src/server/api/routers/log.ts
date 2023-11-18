import { TRPCError } from '@trpc/server';
import fs from 'fs';
import fsPromises, { FileHandle } from 'fs/promises';
import { logFilePath } from '~/tools/constants';
import { LogMessage } from '~/types/log';

import { adminProcedure, createTRPCRouter } from '../trpc';

let logFileHandle: FileHandle;
let logFileBuffer: Buffer;

export const logRouter = createTRPCRouter({
  poll: adminProcedure.query(async () => {
    const exists = fs.existsSync(logFilePath);

    if (!exists) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'The log file does not exist on the file system',
      });
    }

    if (!logFileHandle) {
      logFileHandle = await fsPromises.open(logFilePath);
      logFileBuffer = await logFileHandle.readFile();
    }

    const contentAsString = logFileBuffer.toString();
    return contentAsString
      .split('\n')
      .filter((line) => line.length > 0)
      .map((line) => ({ message: line }) as LogMessage);
  }),
});
