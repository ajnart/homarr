import { IconZoomQuestion } from "@tabler/icons-react";

import { getIntegrationKindsByCategory } from "@homarr/definitions";

import { createWidgetDefinition } from "../../definition";
import { optionsBuilder } from "../../options";

export const { componentLoader, definition } = createWidgetDefinition("mediaRequests-requestList", {
  icon: IconZoomQuestion,
  createOptions() {
    return optionsBuilder.from((factory) => ({
      linksTargetNewTab: factory.switch({
        defaultValue: true,
      }),
    }));
  },
  supportedIntegrations: getIntegrationKindsByCategory("mediaRequest"),
}).withDynamicImport(() => import("./component"));
