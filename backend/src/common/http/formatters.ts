export const toNumber = (value: unknown) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'bigint') return Number(value);
  if (typeof value === 'number') return value;
  if (typeof value === 'object' && value !== null && 'toString' in value) {
    const parsed = Number(String(value));
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

export const storageUrl = (value: string | null | undefined) => {
  if (!value) return null;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  if (value.startsWith('/storage/')) return value;
  if (value.startsWith('storage/')) return `/${value}`;
  if (value.startsWith('public/')) return `/storage/${value.replace(/^public\//, '')}`;
  return `/storage/${value}`;
};

export const itemTypeToApiType = (itemType: string) => {
  if (itemType === 'App\\Models\\RealEstate') return 'realestate';
  if (itemType === 'App\\Models\\Furniture') return 'furniture';
  return itemType;
};

export const boolFromUnknown = (value: unknown) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
  }
  return false;
};
