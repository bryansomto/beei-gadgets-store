export const generateStableKey = (items: {
    id?: string;
    name?: string;
  }, index: number, prefix = '') => {
    return [
      prefix,
      items.id,
      items.name,
      index
    ].filter(Boolean).join('-');
  };