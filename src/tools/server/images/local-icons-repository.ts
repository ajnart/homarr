import fs from 'fs';

import {
  AbstractIconRepository,
  NormalizedIcon,
  NormalizedIconRepositoryResult,
} from './abstract-icons-repository';
import Consola from 'consola';

const iconsDirectory = './public/icons';

export class LocalIconsRepository extends AbstractIconRepository {
  constructor() {
    super('');
  }

  protected async fetchInternally(): Promise<NormalizedIconRepositoryResult> {
    if (!fs.existsSync(iconsDirectory)) {
      Consola.info('Local icons repository directory does not exist');
      return {
        count: 0,
        entries: [],
        name: 'Local',
        success: true,
        copyright: this.copyright,
      };
    }

    const files = fs.readdirSync(iconsDirectory);
    Consola.info(`Local icons repository directory exists and contains ${files.length} icons`);

    const normalizedEntries = files
      .filter((file) => ['.png', '.svg', '.jpeg', '.jpg'].some((x) => file.endsWith(x)))
      .map(
        (file): NormalizedIcon => {
          const stats = fs.statSync(`${iconsDirectory}/${file}`);
          return {
            name: file,
            url: `/icons/${file}`,
            size: stats.size,
          };
        }
      );

    return {
      entries: normalizedEntries,
      count: normalizedEntries.length,
      success: true,
      name: this.name,
      copyright: this.copyright,
    };
  }

  protected name: string = "Local";
}
