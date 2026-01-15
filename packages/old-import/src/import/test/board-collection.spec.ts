import { describe, expect, test } from "vitest";

import type { BoardSize } from "@homarr/old-schema";

import { hasEnoughItemShapes } from "../collections/board-collection";

const defaultShape = {
  location: {
    x: 0,
    y: 0,
  },
  size: {
    width: 1,
    height: 1,
  },
};

describe("hasEnoughItemShapes should check if there are more than one shape available for automatic reconstruction", () => {
  test.each([
    [true, [], []], // no items, so nothing to check
    [true, [{ lg: true }], []], // lg always exists
    [true, [], [{ md: true }]], // md always exists
    [true, [{ md: true, sm: true }], [{ md: true, lg: true }]], // md always exists
    [true, [{ md: true }], [{ md: true }]], // md always exists
    [false, [{ md: true }, { md: true }], [{ lg: true }]], // md is missing for widgets
    [false, [{ md: true }], [{ lg: true }]], // md is missing for widgets
    [false, [{ md: true }], [{ md: true, lg: true }, { lg: true }]], // md is missing for 2. widget
  ] as [boolean, Shape[], Shape[]][])(
    "should return %s if there are more than one shape available",
    (returnValue, appShapes, widgetShapes) => {
      const result = hasEnoughItemShapes({
        apps: appShapes.map((shapes) => ({
          shape: {
            sm: shapes.sm ? defaultShape : undefined,
            md: shapes.md ? defaultShape : undefined,
            lg: shapes.lg ? defaultShape : undefined,
          },
        })),
        widgets: widgetShapes.map((shapes) => ({
          shape: {
            sm: shapes.sm ? defaultShape : undefined,
            md: shapes.md ? defaultShape : undefined,
            lg: shapes.lg ? defaultShape : undefined,
          },
        })),
      });

      expect(result).toBe(returnValue);
    },
  );
});

type Shape = Partial<Record<BoardSize, true>>;
