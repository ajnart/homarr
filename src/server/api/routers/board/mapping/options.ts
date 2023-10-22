import { MapWidget } from './widget';

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
