const rawSocketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5001/api';

const deriveOrigin = (url: string): string => {
  try {
    return new URL(url).origin;
  } catch (error) {
    return url.replace(/\/$/, '').replace(/\/api$/, '');
  }
};

export const SOCKET_URL = rawSocketUrl && rawSocketUrl.length > 0
  ? rawSocketUrl
  : deriveOrigin(rawApiUrl);
