import type { CommonOldmarrWidgetDefinition } from "./common";

export type OldmarrDashdotDefinition = CommonOldmarrWidgetDefinition<
  "dashdot",
  {
    dashName: string;
    url: string;
    usePercentages: boolean;
    columns: number;
    graphHeight: number;
    graphsOrder: (
      | {
          key: "storage";
          subValues: {
            enabled: boolean;
            compactView: boolean;
            span: number;
            multiView: boolean;
          };
        }
      | {
          key: "network";
          subValues: {
            enabled: boolean;
            compactView: boolean;
            span: number;
          };
        }
      | {
          key: "cpu";
          subValues: {
            enabled: boolean;
            multiView: boolean;
            span: number;
          };
        }
      | {
          key: "ram";
          subValues: {
            enabled: boolean;
            span: number;
          };
        }
      | {
          key: "gpu";
          subValues: {
            enabled: boolean;
            span: number;
          };
        }
    )[];
  }
>;
