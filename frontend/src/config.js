export const API = process.env.REACT_APP_API;
export const API_SIGNUP = `${API}/users/register`;
export const API_LOGIN = `${API}/users/login`;
export const API_LOGOUT = `${API}/users/logout`;
export const API_LOGOUT_ALL = `${API}/users/logout-all`;
export const API_AUTH_LOGIN = `${API}/users/relogin`;

export const API_TOKEN_HEADER = process.env.REACT_APP_TOKEN_HEADER;
export const API_REFRESH_TOKEN_HEADER =
  process.env.REACT_APP_REFRESH_TOKEN_HEADER;

export const SESSION_STORAGE_KEY = 'myapptoken';
