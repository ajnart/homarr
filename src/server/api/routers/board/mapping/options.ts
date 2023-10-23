import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { widgetOptions } from '~/server/db/schema';
import { objectEntries } from '~/tools/object';

import { MapWidget } from './widget';

/**
 * Mapping for database
 */

type WidgetOption = InferSelectModel<typeof widgetOptions>;

export const prepareWidgetOptionsForDb = (obj: Record<string, unknown>, widgetId: string) => {
  const entries = objectEntries(obj);
  const arr: WidgetOption[] = [];
  for (const [key, value] of entries) {
    switchEntry(arr, key, value, widgetId);
  }
  return arr;
};

const addNormalEntry = (
  arr: WidgetOption[],
  key: string,
  value: string | number | boolean | null,
  widgetId: string
) => {
  const type = value === null || value === undefined ? 'null' : typeof value;
  if (type === 'bigint' || type === 'function' || type === 'symbol' || type === 'undefined') return;
  arr.push({ path: key, value: (value ?? 'null').toString(), type: type, widgetId });
};

const addObjectEntry = (arr: WidgetOption[], key: string, value: object, widgetId: string) => {
  arr.push({ path: key, value: '', type: 'object', widgetId });
  Object.entries(value).forEach(([k, v]) => {
    switchEntry(arr, `${key}.${k}`, v, widgetId);
  });
};

const addArrayEntry = (arr: WidgetOption[], key: string, value: unknown[], widgetId: string) => {
  arr.push({ path: key, value: value.length.toString(), type: 'array', widgetId });
  value.forEach((v, index) => {
    switchEntry(arr, `${key}.${index}`, v, widgetId);
  });
};

const switchEntry = (arr: WidgetOption[], key: string, value: unknown, widgetId: string) => {
  if (Array.isArray(value)) {
    addArrayEntry(arr, key, value, widgetId);
  } else if (typeof value === 'object' && value !== null) {
    addObjectEntry(arr, key, value, widgetId);
  } else if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string'
  ) {
    addNormalEntry(arr, key, value ?? null, widgetId);
  }
};

/**
 * Mapping from database
 */

type MapOption = MapWidget['options'][number];

export const mapWidgetOptions = (options: MapOption[]) => {
  const result = {} as Record<string, unknown>;
  const sorted = options.sort((a, b) => a.path.localeCompare(b.path));
  sorted.forEach((item) => {
    addAtPath(result, item);
  });
  return result;
};

const addAtPath = (outerObj: Record<string, unknown>, item: MapOption) => {
  const { path, value } = item;
  const pathArray = path.split('.');
  const lastKey = pathArray.pop()!;
  let current: any = outerObj;
  pathArray.forEach((key) => {
    if (Array.isArray(current)) {
      current = current[parseInt(key, 10)];
    } else if (typeof current === 'object') {
      current = current[key];
    }
  });

  if (item.type === 'array') {
    current[lastKey] = [];
  } else if (item.type === 'object') {
    current[lastKey] = {};
  } else if (item.type === 'number' && value) {
    current[lastKey] = value.includes('.') ? parseFloat(value) : parseInt(value, 10);
  } else if (item.type === 'boolean') {
    current[lastKey] = value === 'true';
  } else if (item.type === 'string') {
    current[lastKey] = value;
  } else if (item.type === 'null') {
    current[lastKey] = null;
  }
};
