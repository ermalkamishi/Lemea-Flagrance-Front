import { getApiBaseUrl } from './apiBase';

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (
    imagePath.startsWith('http') ||
    imagePath.startsWith('data:') ||
    imagePath.startsWith('blob:') ||
    imagePath.startsWith('/assets/') ||
    imagePath.startsWith('/src/') ||
    imagePath.startsWith('/@') ||
    imagePath.includes('/assets/')
  ) {
    return imagePath;
  }
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};
