// Access token is kept in memory only (not localStorage/sessionStorage) to
// reduce XSS exposure. It's lost on full page reload, at which point the
// axios interceptor silently calls /refresh-token (backed by the httpOnly
// refresh cookie) to obtain a new one.
let accessToken: string | null = null;

export const tokenStore = {
  get: () => accessToken,
  set: (token: string | null) => {
    accessToken = token;
  },
  clear: () => {
    accessToken = null;
  },
};
