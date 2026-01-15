import { IconNotes } from "@tabler/icons-react";

import { createWidgetDefinition } from "../definition";
import { optionsBuilder } from "../options";
import { defaultContent } from "./default-content";

export const { definition, componentLoader } = createWidgetDefinition("notebook", {
  icon: IconNotes,
  createOptions() {
    return optionsBuilder.from(
      (factory) => ({
        showToolbar: factory.switch({
          defaultValue: true,
        }),
        allowReadOnlyCheck: factory.switch({
          defaultValue: true,
        }),
        content: factory.text({
          defaultValue: defaultContent,
        }),
      }),
      {
        content: {
          shouldHide: () => true, // Hide the content option as it can be modified in the editor
        },
      },
    );
  },
}).withDynamicImport(() => import("./component"));
