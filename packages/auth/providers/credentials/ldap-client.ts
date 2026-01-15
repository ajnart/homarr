import type { Entry, SearchOptions as LdapSearchOptions } from "ldapts";
import { Client } from "ldapts";

import { objectEntries } from "@homarr/common";

import { env } from "../../env";

export interface BindOptions {
  distinguishedName: string;
  password: string;
}

interface SearchOptions {
  base: string;
  options: LdapSearchOptions;
}

export class LdapClient {
  private client: Client;

  constructor() {
    this.client = new Client({
      url: env.AUTH_LDAP_URI,
    });
  }

  /**
   * Binds to the LDAP server with the provided distinguishedName and password.
   * @param distinguishedName distinguishedName to bind to
   * @param password password to bind with
   * @returns void
   */
  public async bindAsync({ distinguishedName, password }: BindOptions) {
    return await this.client.bind(distinguishedName, password);
  }

  /**
   * Search for entries in the LDAP server.
   * @param base base DN to start the search
   * @param options search options
   * @returns list of search results
   */
  public async searchAsync({ base, options }: SearchOptions) {
    const { searchEntries } = await this.client.search(base, options);

    return searchEntries.map((entry) => {
      return {
        ...objectEntries(entry)
          .map(([key, value]) => [key, LdapClient.convertEntryPropertyToString(value)] as const)
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {} as Record<string, string>),
        dn: LdapClient.getEntryDn(entry),
      } as {
        [key: string]: string;
        dn: string;
      };
    });
  }

  private static convertEntryPropertyToString(value: Entry[string]) {
    const firstValue = Array.isArray(value) ? (value[0] ?? "") : value;

    if (typeof firstValue === "string") {
      return firstValue;
    }

    return firstValue.toString("utf8");
  }

  /**
   * dn is the only attribute returned with special characters formatted in UTF-8 (Bad for any letters with an accent)
   * Regex replaces any backslash followed by 2 hex characters with a percentage unless said backslash is preceded by another backslash.
   * That can then be processed by decodeURIComponent which will turn back characters to normal.
   * @param entry search entry from ldap
   * @returns normalized distinguishedName
   */
  private static getEntryDn(entry: Entry) {
    try {
      return decodeURIComponent(entry.dn.replace(/(?<!\\)\\([0-9a-fA-F]{2})/g, "%$1"));
    } catch {
      throw new Error(`Cannot resolve distinguishedName for the entry ${entry.dn}`);
    }
  }

  /**
   * Disconnects the client from the LDAP server.
   */
  public async disconnectAsync() {
    await this.client.unbind();
  }
}
