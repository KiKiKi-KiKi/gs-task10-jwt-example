import React, { useState, useContext, useCallback, createContext } from 'react';
import Modal from '../shared/Modal';
import UserContext from '../../contexts/user';
import { MODAL_LOGIN, MODAL_SIGNUP } from '../../actions/modal';
import SignupModal from './SignupModal';
import LoginModal from './LoginModal';

const LoginSignUpContext = createContext();

const LoginSignUpProvider = ({ ...props }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const state = {
    name,
    email,
    password,
    setName,
    setEmail,
    setPassword,
  };

  return (
    <LoginSignUpContext.Provider value={state}>
      {props.children}
    </LoginSignUpContext.Provider>
  );
};

export default function LoginSignupModal({
  isOpen,
  mode,
  onClose,
  onChangeModalMode,
}) {
  const { handleSignup, handleLogin } = useContext(UserContext);

  const isSignupMode = mode === MODAL_SIGNUP;

  const onToggleMode = useCallback(
    (e) => {
      e.preventDefault();
      const mode = isSignupMode ? MODAL_LOGIN : MODAL_SIGNUP;
      onChangeModalMode(mode);
    },
    [isSignupMode, onChangeModalMode],
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal__header">
        <h5 className="modal__title">{mode.toUpperCase()}</h5>
        <button className="modal__close-btn" onClick={onClose}>
          &times;
        </button>
      </div>
      <div className="modal__body">
        <LoginSignUpProvider>
          <LoginSignUpContext.Consumer>
            {(props) => {
              return isSignupMode ? (
                <SignupModal
                  onSubmitData={handleSignup}
                  onClose={onClose}
                  {...props}
                />
              ) : (
                <LoginModal
                  onSubmitData={handleLogin}
                  onClose={onClose}
                  {...props}
                />
              );
            }}
          </LoginSignUpContext.Consumer>
        </LoginSignUpProvider>
      </div>
      <div className="modal__footer">
        <button className="btn btn-link" onClick={onToggleMode}>
          {isSignupMode ? 'login' : 'signup'}
        </button>
      </div>
    </Modal>
  );
}
