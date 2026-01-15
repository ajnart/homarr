import { createId } from "@paralleldrive/cuid2";
import { describe, expect, test } from "vitest";

import type { GridAlgorithmItem } from "../grid-algorithm";
import { generateResponsiveGridFor } from "../grid-algorithm";

const ROOT_SECTION_ID = "section";

/**
 * If you want to see how the layouts progress between the different layouts, you can find images here:
 * https://github.com/homarr-labs/architecture-documentation/tree/main/grid-algorithm#graphical-representation-of-the-algorithm
 */
describe("Grid Algorithm", () => {
  test.each(itemTests)("should convert a grid with %i columns to a grid with %i columns", (_, _ignored, item) => {
    const input = generateInputFromText(item.input);

    const result = generateResponsiveGridFor({
      items: input,
      width: item.outputColumnCount,
      previousWidth: item.inputColumnCount,
      sectionId: ROOT_SECTION_ID,
    });

    const output = generateOutputText(result.items, item.outputColumnCount);

    expect(output).toBe(item.output);
  });
  test.each(dynamicSectionTests)(
    "should convert a grid with dynamic sections from 16 columns to %i columns",
    (_, testInput) => {
      const outerDynamicSectionId = "b";
      const innerDynamicSectionId = "f";
      const items = [
        algoItem({ id: "a", width: 2, height: 2 }),
        algoItem({ id: outerDynamicSectionId, type: "section", width: 12, height: 3, yOffset: 2 }),
        algoItem({ id: "a", width: 2, sectionId: outerDynamicSectionId }),
        algoItem({ id: "b", width: 4, sectionId: outerDynamicSectionId, xOffset: 2 }),
        algoItem({ id: "c", width: 2, sectionId: outerDynamicSectionId, xOffset: 6 }),
        algoItem({ id: "d", width: 1, sectionId: outerDynamicSectionId, xOffset: 8 }),
        algoItem({ id: "e", width: 3, sectionId: outerDynamicSectionId, xOffset: 9 }),
        algoItem({
          id: innerDynamicSectionId,
          type: "section",
          width: 8,
          height: 2,
          yOffset: 1,
          sectionId: outerDynamicSectionId,
        }),
        algoItem({ id: "a", width: 2, sectionId: innerDynamicSectionId }),
        algoItem({ id: "b", width: 5, xOffset: 2, sectionId: innerDynamicSectionId }),
        algoItem({ id: "c", width: 1, height: 2, xOffset: 7, sectionId: innerDynamicSectionId }),
        algoItem({ id: "d", width: 7, yOffset: 1, sectionId: innerDynamicSectionId }),
        algoItem({ id: "g", width: 4, yOffset: 1, sectionId: outerDynamicSectionId, xOffset: 8 }),
        algoItem({ id: "h", width: 3, yOffset: 2, sectionId: outerDynamicSectionId, xOffset: 8 }),
        algoItem({ id: "i", width: 1, yOffset: 2, sectionId: outerDynamicSectionId, xOffset: 11 }),
        algoItem({ id: "c", width: 5, yOffset: 5 }),
      ];

      const newItems = generateResponsiveGridFor({
        items,
        width: testInput.outputColumns,
        previousWidth: 16,
        sectionId: ROOT_SECTION_ID,
      });

      const rootItems = newItems.items.filter((item) => item.sectionId === ROOT_SECTION_ID);
      const outerSection = items.find((item) => item.id === outerDynamicSectionId);
      const outerItems = newItems.items.filter((item) => item.sectionId === outerDynamicSectionId);
      const innerSection = items.find((item) => item.id === innerDynamicSectionId);
      const innerItems = newItems.items.filter((item) => item.sectionId === innerDynamicSectionId);

      expect(generateOutputText(rootItems, testInput.outputColumns)).toBe(testInput.root);
      expect(generateOutputText(outerItems, Math.min(testInput.outputColumns, outerSection?.width ?? 999))).toBe(
        testInput.outer,
      );
      expect(generateOutputText(innerItems, Math.min(testInput.outputColumns, innerSection?.width ?? 999))).toBe(
        testInput.inner,
      );
    },
  );
});

const algoItem = (item: Partial<GridAlgorithmItem>): GridAlgorithmItem => ({
  id: createId(),
  type: "item",
  width: 1,
  height: 1,
  xOffset: 0,
  yOffset: 0,
  sectionId: ROOT_SECTION_ID,
  ...item,
});

const sixteenColumns = `
abbccccddddeeefg
hbbccccddddeeeij
klllmmmmmnneeeop
qlllmmmmmnnrrrst
ulllmmmmmnnrrrvw
xyz           äö`;

// Just add two empty columns to the right
const eighteenColumns = sixteenColumns
  .split("\n")
  .map((line, index) => (index === 0 ? line : `${line}  `))
  .join("\n");

const tenColumns = `
abbcccceee
fbbcccceee
ddddghieee
ddddjklllo
mmmmmplllq
mmmmmslllt
mmmmmnnrrr
uvwxynnrrr
zäö  nn   `;

const sixColumns = `
abbfgh
ibbjko
ccccnn
ccccnn
ddddnn
ddddpq
eeelll
eeelll
eeelll
mmmmms
mmmmmt
mmmmmu
rrrvwx
rrryzä
ö     `;
const threeColumns = `
abb
fbb
ccc
ccc
ddd
ddd
eee
eee
eee
ghi
jko
lll
lll
lll
mmm
mmm
mmm
nnp
nnq
nns
rrr
rrr
tuv
wxy
zäö`;

const itemTests = [
  {
    input: sixteenColumns,
    inputColumnCount: 16,
    output: sixteenColumns,
    outputColumnCount: 16,
  },
  {
    input: sixteenColumns,
    inputColumnCount: 16,
    output: eighteenColumns,
    outputColumnCount: 18,
  },
  {
    input: sixteenColumns,
    inputColumnCount: 16,
    output: tenColumns,
    outputColumnCount: 10,
  },
  {
    input: sixteenColumns,
    inputColumnCount: 16,
    output: sixColumns,
    outputColumnCount: 6,
  },
  {
    input: sixteenColumns,
    inputColumnCount: 16,
    output: threeColumns,
    outputColumnCount: 3,
  },
].map((item) => [item.inputColumnCount, item.outputColumnCount, item] as const);

const dynamicSectionTests = [
  {
    outputColumns: 16,
    root: `
aa              
aa              
bbbbbbbbbbbb    
bbbbbbbbbbbb    
bbbbbbbbbbbb    
ccccc           `,
    outer: `
aabbbbccdeee
ffffffffgggg
ffffffffhhhi`,
    inner: `
aabbbbbc
dddddddc`,
  },
  {
    outputColumns: 10,
    root: `
aaccccc   
aa        
bbbbbbbbbb
bbbbbbbbbb
bbbbbbbbbb
bbbbbbbbbb`,
    outer: `
aabbbbccdi
eeegggghhh
ffffffff  
ffffffff  `,
    inner: `
aabbbbbc
dddddddc`,
  },
  {
    outputColumns: 6,
    root: `
aa    
aa    
bbbbbb
bbbbbb
bbbbbb
bbbbbb
bbbbbb
bbbbbb
bbbbbb
ccccc `,
    outer: `
aabbbb
ccdeee
ffffff
ffffff
ffffff
ggggi 
hhh   `,
    inner: `
aa   c
bbbbbc
dddddd`,
  },
  {
    outputColumns: 3,
    root: `
aa 
aa 
bbb
bbb
bbb
bbb
bbb
bbb
bbb
bbb
bbb
bbb
bbb
ccc`,
    outer: `
aad
bbb
cci
eee
fff
fff
fff
fff
fff
ggg
hhh`,
    inner: `
aa 
bbb
c  
c  
ddd`,
  },
].map((item) => [item.outputColumns, item] as const);

const generateInputFromText = (text: string) => {
  const lines = text.split("\n").slice(1); // Remove first empty row
  const items: GridAlgorithmItem[] = [];
  for (let yOffset = 0; yOffset < lines.length; yOffset++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const line = lines[yOffset]!;
    for (let xOffset = 0; xOffset < line.length; xOffset++) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const char = line[xOffset]!;
      if (char === " ") continue;
      if (items.some((item) => item.id === char)) continue;
      items.push({
        id: char,
        type: "item",
        width: getWidth(line, xOffset, char),
        height: getHeight(lines, { x: xOffset, y: yOffset }, char),
        xOffset,
        yOffset,
        sectionId: ROOT_SECTION_ID,
      });
    }
  }

  return items;
};

const generateOutputText = (items: GridAlgorithmItem[], columnCount: number) => {
  const occupied2d: string[][] = [];
  for (const item of items) {
    addItemToOccupied(occupied2d, item, { x: item.xOffset, y: item.yOffset }, columnCount);
  }

  return `\n${occupied2d.map((row) => row.join("")).join("\n")}`;
};

const getWidth = (line: string, offset: number, char: string) => {
  const row = line.split("");
  let width = 1;
  for (let xOffset = offset + 1; xOffset < row.length; xOffset++) {
    if (row[xOffset] === char) {
      width++;
    } else {
      break;
    }
  }
  return width;
};

const getHeight = (lines: string[], position: { x: number; y: number }, char: string) => {
  let height = 1;
  for (let yOffset = position.y + 1; yOffset < lines.length; yOffset++) {
    if (lines[yOffset]?.[position.x] === char) {
      height++;
    } else {
      break;
    }
  }
  return height;
};

const addItemToOccupied = (
  occupied2d: string[][],
  item: GridAlgorithmItem,
  position: { x: number; y: number },
  columnCount: number,
) => {
  for (let yOffset = 0; yOffset < item.height; yOffset++) {
    let row = occupied2d[position.y + yOffset];
    if (!row) {
      addRow(occupied2d, columnCount);
      // After adding it, it must exist
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      row = occupied2d[position.y + yOffset]!;
    }

    for (let xOffset = 0; xOffset < item.width; xOffset++) {
      row[position.x + xOffset] = item.id;
    }
  }
};

const addRow = (occupied2d: string[][], columnCount: number) => {
  occupied2d.push(new Array<string>(columnCount).fill(" "));
};
