import {readFile, writeFile} from 'fs/promises';
import {integrationDefs} from '../packages/definitions/src/integration';

const FILE = 'docs/README.md';
const MAX_COLUMNS_PER_ROW = 7;

async function updateIntegrationList() {
  // Read current README content
  const content = await readFile(FILE, 'utf8');

  // Define markers
  const startMarker = '<!-- AUTO_GENERATE_INTEGRATION_LIST_START -->';
  const endMarker = '<!-- AUTO_GENERATE_INTEGRATION_LIST_END -->';

  // Find the section to replace
  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error('Could not find markers in README.md');
  }

  // Generate the new integration list
  const integrations = Object.values(integrationDefs)
    .filter(def => def.name !== 'Mock')
    .sort((a, b) => a.name.localeCompare(b.name));
  const tableRows: string[] = [];
  let currentRow: string[] = [];

  integrations.forEach((integration) => {
    currentRow.push(`<td align="center">
<a href="${integration.documentationUrl}" target="_blank" rel="noreferrer noopener">
  <img src="${integration.iconUrl}" alt="${integration.name}" width="90" height="90" />
  <br/>  
  <p align="center">${integration.name.replaceAll(' ', '<br/>')}</p>
</a>
</td>`);

    if (currentRow.length === MAX_COLUMNS_PER_ROW) {
      tableRows.push(`<tr>${currentRow.join('\n')}</tr>`);
      currentRow = [];
    }
  });

  // Add remaining items if any
  if (currentRow.length > 0) {
    tableRows.push(`<tr>${currentRow.join('\n')}</tr>`);
  }

  // Create the new content
  const newSection = `${startMarker}

<div align="center">
<table>
<tbody>
${tableRows.join('\n')}
</tbody>
</table>
</div>

${endMarker}`;

  // Replace the old section with the new one
  const newContent = content.slice(0, startIndex) + newSection + content.slice(endIndex + endMarker.length);

  // Write the updated content back to the file
  await writeFile(FILE, newContent, 'utf8');
}

updateIntegrationList().catch(console.error);