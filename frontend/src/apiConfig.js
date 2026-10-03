const getApiBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl) {
    const cleanUrl = envUrl.replace(/\/+$/, '');
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  }
  const host = typeof window !== 'undefined' && window.location ? window.location.hostname : 'localhost';
  return `http://${host}:8001/api`;
};

export const API_BASE_URL = getApiBaseUrl();
export default API_BASE_URL;
