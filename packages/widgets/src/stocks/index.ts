import { IconBuildingBank } from "@tabler/icons-react";

import { createWidgetDefinition } from "../definition";
import { optionsBuilder } from "../options";

export const stockPriceTimeFrames = {
  range: ["1d", "5d", "1mo", "3mo", "6mo", "ytd", "1y", "2y", "5y", "10y", "max"] as const,
  interval: ["5m", "15m", "30m", "1h", "1d", "5d", "1wk", "1mo"] as const,
};

const timeRangeOptions = stockPriceTimeFrames.range;
const timeIntervalOptions = stockPriceTimeFrames.interval;

export const { definition, componentLoader } = createWidgetDefinition("stockPrice", {
  icon: IconBuildingBank,
  createOptions() {
    return optionsBuilder.from((factory) => ({
      stock: factory.text({
        defaultValue: "AAPL",
      }),
      timeRange: factory.select({
        defaultValue: "1mo",
        options: timeRangeOptions.map((value) => ({
          value,
          label: (t) => t(`widget.stockPrice.option.timeRange.option.${value}.label`),
        })),
      }),
      timeInterval: factory.select({
        defaultValue: "1d",
        options: timeIntervalOptions.map((value) => ({
          value,
          label: (t) => t(`widget.stockPrice.option.timeInterval.option.${value}.label`),
        })),
      }),
    }));
  },
}).withDynamicImport(() => import("./component"));
