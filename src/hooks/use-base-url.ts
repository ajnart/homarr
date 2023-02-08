export const useBaseUrl = () => {
  if (typeof window === 'undefined') return null;
  return window.location.origin;
};
