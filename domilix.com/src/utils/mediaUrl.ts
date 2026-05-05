export const backendOrigin = 'https://api.domilix.com';

export const mediaUrl = (file?: string | null) => {
  if (!file) return undefined;
  if (file.startsWith('http://') || file.startsWith('https://')) return file;
  return `${backendOrigin}${file}`;
};
