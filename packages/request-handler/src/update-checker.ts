import dayjs from "dayjs";
import { Octokit } from "octokit";
import { compareSemVer, isValidSemVer } from "semver-parser";

import { env } from "@homarr/common/env";
import { fetchWithTrustedCertificatesAsync } from "@homarr/core/infrastructure/http";
import { createLogger } from "@homarr/core/infrastructure/logs";
import { createChannelWithLatestAndEvents } from "@homarr/redis";
import { createCachedRequestHandler } from "@homarr/request-handler/lib/cached-request-handler";

import packageJson from "../../../package.json";

const logger = createLogger({ module: "updateCheckerRequestHandler" });

export const updateCheckerRequestHandler = createCachedRequestHandler({
  queryKey: "homarr-update-checker",
  cacheDuration: dayjs.duration(1, "hour"),
  async requestAsync(_) {
    if (env.NO_EXTERNAL_CONNECTION)
      return {
        availableUpdates: [],
      };

    const octokit = new Octokit({
      request: {
        fetch: fetchWithTrustedCertificatesAsync,
      },
    });
    const releases = await octokit.rest.repos.listReleases({
      owner: "homarr-labs",
      repo: "homarr",
    });

    const currentVersion = (packageJson as { version: string }).version;
    const availableReleases = [];

    for (const release of releases.data) {
      if (!isValidSemVer(release.tag_name)) {
        logger.warn("Unable to parse semantic tag. Update check might not work.", { tagName: release.tag_name });
        continue;
      }

      availableReleases.push(release);
    }

    const availableNewerReleases = availableReleases
      .filter((release) => compareSemVer(release.tag_name, currentVersion) > 0)
      .sort((releaseA, releaseB) => compareSemVer(releaseB.tag_name, releaseA.tag_name));
    if (availableNewerReleases.length > 0) {
      logger.info(
        "Update checker found a new available version",
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        { version: availableReleases[0]!.tag_name, currentVersion },
      );
    } else {
      logger.debug("Update checker did not find any available updates", { currentVersion });
    }

    return {
      availableUpdates: availableNewerReleases.map((release) => ({
        name: release.name,
        contentHtml: release.body_html,
        url: release.html_url,
        tagName: release.tag_name,
      })),
    };
  },
  createRedisChannel() {
    return createChannelWithLatestAndEvents<{
      availableUpdates: { name: string | null; contentHtml?: string; url: string; tagName: string }[];
    }>("homarr:update");
  },
});
