"use client";

import { spotlightActions } from "./spotlight-store";

export { Spotlight } from "./components/spotlight";
export { openSpotlight };
export {
  SpotlightProvider,
  useRegisterSpotlightContextResults,
  useRegisterSpotlightContextActions,
} from "./modes/home/context";

const openSpotlight = spotlightActions.open;
