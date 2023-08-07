import fs from 'fs';

import {
  AbstractIconRepository,
  NormalizedIcon,
  NormalizedIconRepositoryResult,
} from './abstract-icons-repository';

export class LocalIconsRepository extends AbstractIconRepository {
  constructor() {
    super('');
  }

  protected async fetchInternally(): Promise<NormalizedIconRepositoryResult> {
    if (!fs.existsSync('./public/icons')) {
      return {
        count: 0,
        entries: [],
        name: 'Local',
        success: true,
        copyright: this.copyright,
      };
    }

    const files = fs.readdirSync('./public/icons');

    const normalizedEntries = files
      .filter((file) => ['.png', '.svg', '.jpeg', '.jpg'].some((x) => file.endsWith(x)))
      .map(
        (file): NormalizedIcon => ({
          name: file,
          url: `./icons/${file}`,
          size: 0,
        })
      );

    return {
      entries: normalizedEntries,
      count: normalizedEntries.length,
      success: true,
      name: 'Local',
      copyright: this.copyright,
    };
  }
}
