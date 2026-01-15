import type { ReleaseProviderResponse, ReleaseResponse } from "./releases-providers-types";

export const getLatestRelease = (
  releases: ReleaseProviderResponse[],
  versionRegex?: string,
): ReleaseProviderResponse | null => {
  const validReleases = releases.filter((result) => {
    if (result.latestRelease) {
      return versionRegex ? new RegExp(versionRegex).test(result.latestRelease) : true;
    }
    return true;
  });

  return validReleases.length === 0
    ? null
    : validReleases.reduce((latest, current) => (current.latestReleaseAt > latest.latestReleaseAt ? current : latest));
};

export interface ReleasesProviderIntegration {
  getLatestMatchingReleaseAsync(identifier: string, versionRegex?: string): Promise<ReleaseResponse>;
}
