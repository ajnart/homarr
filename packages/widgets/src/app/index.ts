import {
  IconApps,
  IconDeviceDesktopX,
  IconEyeOff,
  IconLayoutBottombarExpand,
  IconLayoutNavbarExpand,
  IconLayoutSidebarLeftExpand,
  IconLayoutSidebarRightExpand,
  IconTextScan2,
  IconTooltip,
} from "@tabler/icons-react";

import { createWidgetDefinition } from "../definition";
import { optionsBuilder } from "../options";

export const { definition, componentLoader } = createWidgetDefinition("app", {
  icon: IconApps,
  createOptions(settings) {
    return optionsBuilder.from(
      (factory) => ({
        appId: factory.app(),
        openInNewTab: factory.switch({ defaultValue: true }),
        showTitle: factory.switch({ defaultValue: true }),
        descriptionDisplayMode: factory.select({
          options: [
            {
              label(t) {
                return t("widget.app.option.descriptionDisplayMode.option.normal");
              },
              value: "normal",
              icon: IconTextScan2,
            },
            {
              label(t) {
                return t("widget.app.option.descriptionDisplayMode.option.tooltip");
              },
              value: "tooltip",
              icon: IconTooltip,
            },
            {
              label(t) {
                return t("widget.app.option.descriptionDisplayMode.option.hidden");
              },
              value: "hidden",
              icon: IconEyeOff,
            },
          ],
          defaultValue: "hidden",
          searchable: true,
          withDescription: true,
        }),
        layout: factory.select({
          options: [
            {
              label(t) {
                return t("widget.app.option.layout.option.column");
              },
              value: "column",
              icon: IconLayoutNavbarExpand,
            },
            {
              label(t) {
                return t("widget.app.option.layout.option.column-reverse");
              },
              value: "column-reverse",
              icon: IconLayoutBottombarExpand,
            },
            {
              label(t) {
                return t("widget.app.option.layout.option.row");
              },
              value: "row",
              icon: IconLayoutSidebarLeftExpand,
            },
            {
              label(t) {
                return t("widget.app.option.layout.option.row-reverse");
              },
              value: "row-reverse",
              icon: IconLayoutSidebarRightExpand,
            },
          ],
          defaultValue: "column",
          searchable: true,
        }),
        pingEnabled: factory.switch({ defaultValue: settings.enableStatusByDefault }),
      }),
      {
        pingEnabled: {
          shouldHide() {
            return settings.forceDisableStatus;
          },
        },
      },
    );
  },
  errors: {
    NOT_FOUND: {
      icon: IconDeviceDesktopX,
      message: (t) => t("widget.app.error.notFound.label"),
      hideLogsLink: true,
    },
  },
}).withDynamicImport(() => import("./component"));
