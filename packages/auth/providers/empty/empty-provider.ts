import type { OAuthConfig } from "next-auth/providers";

export function EmptyNextAuthProvider(): OAuthConfig<unknown> {
  return {
    id: "empty",
    name: "Empty",
    type: "oauth",
    profile: () => {
      throw new Error(
        "EmptyNextAuthProvider can not be used and is only a placeholder because credentials authentication can not be used as session authentication without additional providers.",
      );
    },
    issuer: "empty",
    authorization: new URL("https://example.empty"),
  };
}
