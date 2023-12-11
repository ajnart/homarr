import yargs from 'yargs';

import { resetPasswordForOwner } from './commands/reset-owner-password.js';
import { resetPasswordForUsername } from './commands/reset-password.js';

yargs(process.argv.slice(2))
  .scriptName('homarr')
  .usage('$0 <cmd> [args]')
  .command('reset-owner-password', 'Resets the current owner password without UI access', async () => {
    await resetPasswordForOwner();
  })
  .command(
    'reset-password',
    'Reset the password of a specific user without UI access',
    (yargs) => {
      yargs.option('username', {
        type: 'string',
        describe: 'Username of user',
        demandOption: true
      });
    },
    async (argv) => {
      await resetPasswordForUsername(argv.username);
    }
  )
  .version(false)
  .showHelpOnFail(true)
  .alias('h', 'help')
  .demandCommand()
  .help().argv;