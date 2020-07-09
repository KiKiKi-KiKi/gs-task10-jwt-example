import React, { useState, useReducer, useCallback, useEffect } from 'react';
import UserContext from './user';
import { LOGIN_USER, LOGOUT_USER } from '../actions/user';
import reducer, { USER_INITIAL_STATE } from '../reducers/user';

import Auth from '../Auth';
const auth = new Auth();

function UseContextProvider({ state, ...props }) {
  return (
    <UserContext.Provider value={state}>{props.children}</UserContext.Provider>
  );
}

function useBuildContainerProps(props) {
  const [state, dispatch] = useReducer(reducer, USER_INITIAL_STATE);
  const [signIn, setSignIn] = useState(false);

  const loginUser = useCallback(() => {
    dispatch({
      type: LOGIN_USER,
      payload: {
        authenticated: true,
        user: auth.getProfile(),
      },
    });
    setSignIn(true);
  }, [dispatch]);

  const logoutUser = useCallback(() => {
    dispatch({
      type: LOGOUT_USER,
      payload: {
        authenticated: false,
        user: {},
      },
    });
    setSignIn(false);
  }, [dispatch]);

  const onSignup = useCallback(
    async (data) => {
      console.log('OnSignup');
      try {
        const res = await auth.signUp(data);
        loginUser();
        return res;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    [loginUser],
  );

  const onLogin = useCallback(
    async (data) => {
      console.log('onLogin');
      try {
        const res = await auth.login(data);
        loginUser();
        return res;
      } catch (err) {
        console.log('err');
        throw err;
      }
    },
    [loginUser],
  );

  const onLogout = useCallback(async () => {
    console.log('onLogout');
    try {
      const res = await auth.logout();
      logoutUser();
      return res;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }, [logoutUser]);

  const onLogoutAll = useCallback(async () => {
    console.log('onLogoutAll');
    try {
      const res = await auth.logoutAll();
      logoutUser();
      return res;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }, [logoutUser]);

  const providerState = {
    ...state,
    handleSignup: onSignup,
    handleLogin: onLogin,
    handleLogout: onLogout,
    handleLogoutAll: onLogoutAll,
  };

  useEffect(() => {
    console.log('> User Provider useEffect', signIn);
    if (!signIn) {
      auth
        .handleAuthentication()
        .then(() => {
          loginUser();
        })
        .catch((err) => {
          console.log('Authentication', err.name, err.message);
          logoutUser();
        });
    }
  }, [signIn, loginUser, logoutUser]);

  return {
    ...props,
    state: providerState,
  };
}

export default function Container(props) {
  return <UseContextProvider {...useBuildContainerProps(props)} />;
}
