import fs from 'fs';

export const getDashboards = () => {
  // Get all the configs in the /data/configs folder
  // All the files that end in ".json"
  const files = fs.readdirSync('./data/configs').filter((file) => file.endsWith('.json'));
  // Strip the .json extension from the file name
  return files.map((file) => file.replace('.json', ''));
};
