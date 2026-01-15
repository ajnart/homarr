import { IconBrowser } from "@tabler/icons-react";

import { createWidgetDefinition } from "../definition";
import { optionsBuilder } from "../options";

export const { definition, componentLoader } = createWidgetDefinition("iframe", {
  icon: IconBrowser,
  createOptions() {
    return optionsBuilder.from((factory) => ({
      embedUrl: factory.text(),
      allowFullScreen: factory.switch(),
      allowScrolling: factory.switch({
        defaultValue: true,
      }),
      allowPayment: factory.switch(),
      allowAutoPlay: factory.switch(),
      allowMicrophone: factory.switch(),
      allowCamera: factory.switch(),
      allowGeolocation: factory.switch(),
    }));
  },
}).withDynamicImport(() => import("./component"));
