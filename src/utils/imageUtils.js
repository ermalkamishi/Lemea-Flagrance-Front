import { getApiBaseUrl } from './apiBase';

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};
