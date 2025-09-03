export interface JwtPayload { exp: number; [key: string]: unknown; }

export const parseJwt = (token: string): JwtPayload | null => {
  try {
    const base64 = token.split('.')[1];
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const payload = parseJwt(token);
  return !payload || Date.now() >= payload.exp * 1000;
};
