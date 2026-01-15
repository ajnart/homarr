export const supportedAuthProviders = ["credentials", "oidc", "ldap"] as const;
export type SupportedAuthProvider = (typeof supportedAuthProviders)[number];
