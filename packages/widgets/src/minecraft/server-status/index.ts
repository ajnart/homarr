import { IconBrandMinecraft } from "@tabler/icons-react";
import { z } from "zod/v4";

import { createWidgetDefinition } from "../../definition";
import { optionsBuilder } from "../../options";

export const { componentLoader, definition } = createWidgetDefinition("minecraftServerStatus", {
  icon: IconBrandMinecraft,
  createOptions() {
    return optionsBuilder.from((factory) => ({
      title: factory.text({ defaultValue: "" }),
      domain: factory.text({ defaultValue: "hypixel.net", validate: z.string().nonempty() }),
      isBedrockServer: factory.switch({ defaultValue: false }),
    }));
  },
}).withDynamicImport(() => import("./component"));
