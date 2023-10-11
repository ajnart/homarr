import { CredentialsConfig } from 'next-auth/providers';
import { env } from '~/env';

const enabledProviders: CredentialsConfig[] = []

if (env.AUTH_PROVIDER.includes('ldap')) enabledProviders.push((await import("./ldap")).default)
if (env.AUTH_PROVIDER.includes('credentials')) enabledProviders.push((await import("./credentials")).default)

// Not working with dynamic import name - webpack doesn't pack the modules

// const availableProviders = {
//     credentials: "./credentials",
//     ldap: "./ldap"
// }
//
// for (let provider of env.AUTH_PROVIDER) {
//     if (!availableProviders[provider]) Consola.error(new Error(`Unknown auth provider: ${provider}`))
//     enabledProviders.push((await import(availableProviders[provider])).default)
// }

export default enabledProviders