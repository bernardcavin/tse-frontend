import { v4 as uuidv4 } from 'uuid';

export function recordToArray<T>(record: Record<string, T>, keyName = 'key', valueName = 'value') {
  return Object.entries(record).map(([k, v]) => ({
    [keyName]: k,
    [valueName]: v,
  }));
}

type AnyObject = Record<string, any>;

export function ensureIdInArray<T extends AnyObject>(arr: T[]): (T & { id: string })[] {
  return arr.map((item) => ({
    ...item,
    id: item.id ?? uuidv4(), // if id not present, generate one
  }));
}

export function renameObjectKeys<T extends Record<string, any>>(
  obj: T,
  keyMap: Record<string, string>
): Record<string, any> {
  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      const newKey = keyMap[key] || key; // use mapped key if exists, else original
      acc[newKey] = value;
      return acc;
    },
    {} as Record<string, any>
  );
}
