import axios from 'axios';
import {
  API_SIGNUP,
  API_LOGIN,
  API_LOGOUT,
  API_LOGOUT_ALL,
  API_AUTH_LOGIN,
  API_TOKEN_HEADER,
  API_REFRESH_TOKEN_HEADER,
  SESSION_STORAGE_KEY,
} from './config';

export default class Auth {
  constructor() {
    this.token = null;
    this.refreshToken = null;

    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.signUp = this.signUp.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.logoutAll = this.logoutAll.bind(this);

    // degaults.header work only 'Content-Type'
    // :beetle: 'content-type', 'Content-type' become duplicate => 'content-type': 'application/json, application/json;charset=UTF-8',
    axios.defaults.headers.common['Content-Type'] = 'application/json';
  }

  getProfile() {
    return this.profile;
  }

  setProfile({ user, name }) {
    this.profile = {
      user,
      name,
    };
  }

  deleteProfile() {
    this.profile = {};
  }

  getHeaderTokens() {
    return {
      'Content-Type': 'application/json',
      [API_TOKEN_HEADER]: this.token,
      [API_REFRESH_TOKEN_HEADER]: this.refreshToken,
    };
  }

  setToken({ token, refreshToken }) {
    this.token = token;
    this.refreshToken = refreshToken;
    // Save session storage
    sessionStorage.setItem(SESSION_STORAGE_KEY, refreshToken);
  }

  deleteToken() {
    this.token = null;
    this.refreshToken = null;
    // Delete session storage
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }

  /**
   * SIGNUP POST DATA
   * data: {name, email, password}
   */
  async signUp(data) {
    console.log('Auth Signup');
    try {
      const res = await axios.post(API_SIGNUP, data);
      console.log(res);
      this.setToken(res.data);
      this.setProfile(res.data);
      return res.data;
    } catch (err) {
      const errorMessage = err.response.data || err.message;
      console.log(err, err.response);
      throw new Error(errorMessage);
    }
  }

  /**
   * LOGIN POST DATA
   * data: {email, password}
   */
  async login(data) {
    console.log('Auth Login');
    try {
      const res = await axios.post(API_LOGIN, data);
      console.log(res);
      this.setToken(res.data);
      this.setProfile(res.data);
      return res.data;
    } catch (err) {
      console.log(err, err.response);
      throw new Error('Email or Password are invalid.');
    }
  }

  /**
   * LOGOUT POST
   * HEADERS: TOKEN, REFRESHTOKEN
   */
  async logout() {
    console.log('Auth Logout');
    try {
      const res = await axios.post(
        API_LOGOUT,
        {},
        {
          headers: this.getHeaderTokens(),
        },
      );
      console.log(res);
      this.deleteProfile();
      this.deleteToken();
      return res.data;
    } catch (err) {
      console.log(err, err.response);
      throw new Error(err.response);
    }
  }

  /**
   * LOGOUT ALL POST
   * HEADERS: TOKEN, REFRESHTOKEN
   */
  async logoutAll() {
    console.log('Auth LogoutAll');
    try {
      const res = await axios.post(
        API_LOGOUT_ALL,
        {},
        {
          headers: this.getHeaderTokens(),
        },
      );
      console.log(res);
      this.deleteProfile();
      this.deleteToken();
      return res.data;
    } catch (err) {
      console.log(err, err.response);
      throw new Error(err.response);
    }
  }

  async handleAuthentication() {
    console.log('Auth handleAuthentication');
    const refreshToken = sessionStorage.getItem(SESSION_STORAGE_KEY);

    if (refreshToken) {
      console.log('Login by session tokn');
      this.refreshToken = refreshToken;
    }

    try {
      if (!this.token && !this.refreshToken) {
        const err = new Error('No token');
        err.name = 'UnLogin';
        throw err;
      }

      const res = await axios.post(
        API_AUTH_LOGIN,
        {},
        {
          headers: { ...this.getHeaderTokens() },
        },
      );
      console.log(res);
      // Update Tokens
      this.setToken(res.data);
      this.setProfile(res.data);

      return res.data;
    } catch (err) {
      console.log(err, err.response);
      throw new Error(err.response);
    }
  }
}
