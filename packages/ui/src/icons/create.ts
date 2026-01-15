import type { IconNode } from "@tabler/icons-react";
import { createReactComponent } from "@tabler/icons-react";
import { parseSync } from "svgson";

import { capitalize } from "@homarr/common";

interface CustomIconOptions {
  name: string;
  svgContent: string;
  type: "outline" | "filled";
}

export const createCustomIcon = ({ svgContent, type, name }: CustomIconOptions) => {
  const icon = parseSync(svgContent);

  const children = icon.children.map(({ name, attributes }, i) => {
    attributes.key = `svg-${i}`;

    attributes.strokeWidth = attributes["stroke-width"] ?? "2";
    delete attributes["stroke-width"];

    return [name, attributes] satisfies IconNode[number];
  });

  const pascalCaseName = `Icon${capitalize(name.replace("-", ""))}`;
  return createReactComponent(type, name, pascalCaseName, children);
};
