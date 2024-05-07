import { NormalizedTorrent, TorrentState } from '@ctrl/shared-torrent';
import { describe, expect, it } from 'vitest';

import { ITorrent, filterTorrents, getTorrentsRatio } from './TorrentTile';

describe('TorrentTile', () => {
  it('filter torrents when stale', () => {
    // arrange
    const widget: ITorrent = {
      id: 'abc',
      area: {
        type: 'sidebar',
        properties: {
          location: 'left',
        },
      },
      shape: {},
      type: 'torrents-status',
      properties: {
        labelFilter: [],
        labelFilterIsWhitelist: false,
        displayCompletedTorrents: true,
        displayActiveTorrents: true,
        speedLimitOfActiveTorrents: 10,
        displayStaleTorrents: false,
        displayRatioWithFilter: false,
        columns: [],
        nameColumnSize: 0,
      },
    };
    const torrents: NormalizedTorrent[] = [
      constructTorrent('ABC', 'Nice Torrent', false, 672, 672),
      constructTorrent('HH', 'I am completed', true, 0, 0),
      constructTorrent('HH', 'I am stale', false, 0, 0),
    ];

    // act
    const filtered = filterTorrents(widget, torrents);

    // assert
    expect(filtered.length).toBe(2);
    expect(filtered.includes(torrents[0])).toBe(true);
    expect(filtered.includes(torrents[1])).toBe(true);
    expect(filtered.includes(torrents[2])).toBe(false);
  });

  it('not filter torrents when stale', () => {
    // arrange
    const widget: ITorrent = {
      id: 'abc',
      area: {
        type: 'sidebar',
        properties: {
          location: 'left',
        },
      },
      shape: {},
      type: 'torrents-status',
      properties: {
        labelFilter: [],
        labelFilterIsWhitelist: false,
        displayCompletedTorrents: true,
        displayActiveTorrents: true,
        speedLimitOfActiveTorrents: 10,
        displayStaleTorrents: true,
        displayRatioWithFilter: false,
        columns: [],
        nameColumnSize: 0,
      },
    };
    const torrents: NormalizedTorrent[] = [
      constructTorrent('ABC', 'Nice Torrent', false, 672, 672),
      constructTorrent('HH', 'I am completed', true, 0, 0),
      constructTorrent('HH', 'I am stale', false, 0, 0),
    ];

    // act
    const filtered = filterTorrents(widget, torrents);

    // assert
    expect(filtered.length).toBe(3);
    expect(filtered.includes(torrents[0])).toBe(true);
    expect(filtered.includes(torrents[1])).toBe(true);
    expect(filtered.includes(torrents[2])).toBe(true);
  });

  it('filter when completed without active torrent', () => {
    // arrange
    const widget: ITorrent = {
      id: 'abc',
      area: {
        type: 'sidebar',
        properties: {
          location: 'left',
        },
      },
      shape: {},
      type: 'torrents-status',
      properties: {
        labelFilter: [],
        labelFilterIsWhitelist: false,
        displayCompletedTorrents: false,
        displayActiveTorrents: false,
        speedLimitOfActiveTorrents: 10,
        displayStaleTorrents: true,
        displayRatioWithFilter: false,
        columns: [],
        nameColumnSize: 0,
      },
    };
    const torrents: NormalizedTorrent[] = [
      constructTorrent('ABC', 'Nice Torrent', false, 672, 672),
      constructTorrent('HH', 'I am completed', true, 0, 672),
      constructTorrent('HH', 'I am stale', false, 0, 0),
    ];

    // act
    const filtered = filterTorrents(widget, torrents);

    // assert
    expect(filtered.length).toBe(2);
    expect(filtered.at(0)).toBe(torrents[0]);
    expect(filtered.includes(torrents[1])).toBe(false);
    expect(filtered.at(1)).toBe(torrents[2]);
  });

  it('filter when completed with active torrent', () => {
    // arrange
    const widget: ITorrent = {
      id: 'abc',
      area: {
        type: 'sidebar',
        properties: {
          location: 'left',
        },
      },
      shape: {},
      type: 'torrents-status',
      properties: {
        labelFilter: [],
        labelFilterIsWhitelist: false,
        displayCompletedTorrents: false,
        displayActiveTorrents: true,
        speedLimitOfActiveTorrents: 10,
        displayStaleTorrents: true,
        displayRatioWithFilter: false,
        columns: [],
        nameColumnSize: 0,
      },
    };
    const torrents: NormalizedTorrent[] = [
      constructTorrent('ABC', 'Nice Torrent', false, 672, 672),
      constructTorrent(
        'HH',
        'I am completed and uploading less than 10 ko/s (10239 ≈ 9.99ko/s)',
        true,
        0,
        10239
      ),
      constructTorrent(
        'HH',
        'I am completed and uploading more than 10 ko/s (10241 ≈ 10.01ko/s)',
        true,
        0,
        10241
      ),
      constructTorrent('HH', 'I am completed', true, 0, 0),
      constructTorrent('HH', 'I am stale', false, 0, 0),
    ];

    // act
    const filtered = filterTorrents(widget, torrents);

    // assert
    expect(filtered.length).toBe(3);
    expect(filtered.at(0)).toBe(torrents[0]);
    expect(filtered.includes(torrents[1])).toBe(false);
    expect(filtered.at(1)).toBe(torrents[2]);
    expect(filtered.includes(torrents[3])).toBe(false);
    expect(filtered.at(2)).toBe(torrents[4]);
  });

  it('filter by label when whitelist', () => {
    // arrange
    const widget: ITorrent = {
      id: 'abc',
      area: {
        type: 'sidebar',
        properties: {
          location: 'left',
        },
      },
      shape: {},
      type: 'torrents-status',
      properties: {
        labelFilter: ['music', 'movie'],
        labelFilterIsWhitelist: true,
        displayCompletedTorrents: true,
        displayActiveTorrents: true,
        speedLimitOfActiveTorrents: 10,
        displayStaleTorrents: true,
        displayRatioWithFilter: false,
        columns: [],
        nameColumnSize: 0,
      },
    };
    const torrents: NormalizedTorrent[] = [
      constructTorrent('1', 'A sick drop', false, 672, 672, 'music'),
      constructTorrent('2', 'I cried', true, 0, 0, 'movie'),
      constructTorrent('3', 'Great Animations', false, 0, 0, 'anime'),
    ];

    // act
    const filtered = filterTorrents(widget, torrents);

    // assert
    expect(filtered.length).toBe(2);
    expect(filtered.at(0)).toBe(torrents[0]);
    expect(filtered.at(1)).toBe(torrents[1]);
    expect(filtered.includes(torrents[2])).toBe(false);
  });

  it('filter by label when blacklist', () => {
    // arrange
    const widget: ITorrent = {
      id: 'abc',
      area: {
        type: 'sidebar',
        properties: {
          location: 'left',
        },
      },
      shape: {},
      type: 'torrents-status',
      properties: {
        labelFilter: ['music', 'movie'],
        labelFilterIsWhitelist: false,
        displayCompletedTorrents: false,
        displayActiveTorrents: false,
        speedLimitOfActiveTorrents: 10,
        displayStaleTorrents: true,
        displayRatioWithFilter: false,
        columns: [],
        nameColumnSize: 0,
      },
    };
    const torrents: NormalizedTorrent[] = [
      constructTorrent('ABC', 'Nice Torrent', false, 672, 672, 'anime'),
      constructTorrent('HH', 'I am completed', true, 0, 0, 'movie'),
      constructTorrent('HH', 'I am stale', false, 0, 0, 'tv'),
    ];

    // act
    const filtered = filterTorrents(widget, torrents);

    // assert
    expect(filtered.length).toBe(2);
    expect(filtered.at(0)).toBe(torrents[0]);
    expect(filtered.includes(torrents[1])).toBe(false);
    expect(filtered.at(1)).toBe(torrents[2]);
  });

  it('calcul ratio', () => {
    // arrange
    const widget: ITorrent = {
      id: 'abc',
      area: {
        type: 'sidebar',
        properties: {
          location: 'left',
        },
      },
      shape: {},
      type: 'torrents-status',
      properties: {
        labelFilter: [],
        labelFilterIsWhitelist: false,
        displayCompletedTorrents: false,
        displayActiveTorrents: false,
        speedLimitOfActiveTorrents: 10,
        displayStaleTorrents: true,
        displayRatioWithFilter: false,
        columns: [],
        nameColumnSize: 0,
      },
    };
    const torrents: NormalizedTorrent[] = [constructTorrent('HH', 'I am completed', true, 0, 0)];

    // act
    const filtered = filterTorrents(widget, torrents);
    const ratioGlobal = getTorrentsRatio(widget, torrents, false);
    const ratioWithFilter = getTorrentsRatio(widget, torrents, true);

    // assert
    expect(filtered.length).toBe(0);
    expect(filtered.includes(torrents[1])).toBe(false);
    expect(ratioGlobal).toBe(378535535 / 23024335);
    expect(ratioWithFilter).toBe(-1); //infinite ratio
  });
});

const constructTorrent = (
  id: string,
  name: string,
  isCompleted: boolean,
  downloadSpeed: number, // Bytes per second in @ctrl/shared-torrent
  uploadSpeed: number, // Bytes per second in @ctrl/shared-torrent
  label?: string
): NormalizedTorrent => ({
  id,
  name,
  connectedPeers: 1,
  connectedSeeds: 4,
  dateAdded: '0',
  downloadSpeed,
  eta: 500,
  isCompleted,
  progress: 50,
  queuePosition: 1,
  ratio: 5.6,
  raw: false,
  savePath: '/downloads',
  state: TorrentState.downloading,
  stateMessage: 'Downloading',
  totalDownloaded: 23024335,
  totalPeers: 10,
  totalSeeds: 450,
  totalSize: 839539535,
  totalSelected: 0,
  totalUploaded: 378535535,
  uploadSpeed,
  label,
});
