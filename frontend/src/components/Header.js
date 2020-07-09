import React, { useContext, useCallback } from 'react';
import UserContext from '../contexts/user';
import { MODAL_LOGIN, MODAL_SIGNUP } from '../actions/modal';
import loginSignupModalContext from '../contexts/loginSignupModal';

const UnLoginNav = function () {
  const { handleShowModal } = useContext(loginSignupModalContext);

  const onShowModal = useCallback(
    (type) => (e) => {
      e.preventDefault();
      handleShowModal(type);
    },
    [handleShowModal],
  );

  return (
    <>
      <button className="btn btn-primary" onClick={onShowModal(MODAL_SIGNUP)}>
        SignUp
      </button>
      <button className="btn btn-default" onClick={onShowModal(MODAL_LOGIN)}>
        Login
      </button>
    </>
  );
};

const LoginUserNav = function () {
  const { user, handleLogout, handleLogoutAll } = useContext(UserContext);

  const onLogout = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        await handleLogout();
        // TODO: redirect to HOME
        alert('logout!');
        return;
      } catch (err) {
        console.log(err);
      }
    },
    [handleLogout],
  );

  const onLogoutAll = useCallback(
    async (e) => {
      e.preventDefault();
      if (!window.confirm('Really logout all devices?')) {
        return;
      }

      try {
        await handleLogoutAll();
        // TODO: redirect to HOME
        alert('logout all devices!');
        return;
      } catch (err) {
        console.log(err);
      }
    },
    [handleLogoutAll],
  );

  return (
    <>
      <div>{user.name}</div>
      <button className="btn btn-danger" onClick={onLogout}>
        Logout
      </button>
      <button className="btn btn-light" onClick={onLogoutAll}>
        Logout All Devices.
      </button>
    </>
  );
};

export default function Header({ isAuthenticated }) {
  return (
    <header className="global-header">
      <div className="container global-header__container">
        <p className="site-logo">APP NAME</p>
        <nav role="navigation">
          <div className="global-header__nav">
            {isAuthenticated ? <LoginUserNav /> : <UnLoginNav />}
          </div>
        </nav>
      </div>
    </header>
  );
}
