import type { Modify } from "@homarr/common/types";
import type { OldmarrConfig } from "@homarr/old-schema";

import type { AnalyseResult } from "./analyse-oldmarr-import";

export type AnalyseConfig = AnalyseResult["configs"][number];
export type ValidAnalyseConfig = Modify<AnalyseConfig, { config: OldmarrConfig }>;
