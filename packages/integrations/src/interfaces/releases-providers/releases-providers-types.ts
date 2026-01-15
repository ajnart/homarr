import type { TranslationObject } from "@homarr/translation";

export interface ReleasesRepository extends Record<string, unknown> {
  id: string;
  identifier: string;
  versionRegex?: string;
}

export interface DetailsProviderResponse {
  projectUrl?: string;
  projectDescription?: string;
  isFork?: boolean;
  isArchived?: boolean;
  createdAt?: Date;
  starsCount?: number;
  openIssues?: number;
  forksCount?: number;
}

export interface ReleaseProviderResponse {
  latestRelease: string;
  latestReleaseAt: Date;
  releaseUrl?: string;
  releaseDescription?: string;
  isPreRelease?: boolean;
}

type ReleasesErrorKeys = keyof TranslationObject["widget"]["releases"]["error"]["messages"];

export type ReleaseData = DetailsProviderResponse & ReleaseProviderResponse;

export type ReleaseError = { code: ReleasesErrorKeys } | { code: "unexpected"; message: string };

export type ReleaseResponse = { success: true; data: ReleaseData } | { success: false; error: ReleaseError };
