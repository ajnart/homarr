import { readFile, writeFile } from "fs/promises";

const replaceTemplate = "#NEXT_VERSION#";
const fileName = ".github/ISSUE_TEMPLATE/bug_report.yml";
const env = {
  NEXT_VERSION: process.env.NEXT_VERSION as string,
};

const content = await readFile(fileName, "utf8");
const updatedContent = content.replace(
  replaceTemplate,
  `${replaceTemplate}\n        - ${env.NEXT_VERSION.replace("v", "")}`,
);
await writeFile(fileName, updatedContent, "utf8");
