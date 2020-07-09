import React, { useReducer, useCallback } from 'react';
import {
  SHOW_MODAL,
  CLOSE_MODAL,
  CHANGE_MODAL,
  MODAL_SIGNUP,
} from '../actions/modal';
import LoginSignupModalContext from './loginSignupModal';
import LoginSignupModal from '../components/LoginSignupModal';

const initialState = {
  isOpen: false,
  mode: MODAL_SIGNUP,
};

const reducer = (state, action) => {
  switch (action.type) {
    case SHOW_MODAL: {
      return {
        ...state,
        isOpen: true,
        mode: action.payload.mode,
      };
    }
    case CLOSE_MODAL: {
      return {
        ...state,
        isOpen: false,
      };
    }
    case CHANGE_MODAL: {
      return {
        ...state,
        mode: action.payload.mode,
      };
    }
    default:
      return state;
  }
};

export default function LoginSignupModalProvider(props) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleShowModal = useCallback((mode = MODAL_SIGNUP) => {
    dispatch({ type: SHOW_MODAL, payload: { mode } });
  }, []);

  const handleCloseModal = useCallback(() => {
    dispatch({ type: CLOSE_MODAL });
  }, []);

  const handleChangeModalMode = useCallback((mode) => {
    dispatch({ type: CHANGE_MODAL, payload: { mode } });
  }, []);

  const providerState = {
    ...state,
    handleShowModal,
    handleCloseModal,
    handleChangeModalMode,
  };

  return (
    <LoginSignupModalContext.Provider value={providerState}>
      {props.children}
      <LoginSignupModal
        isOpen={state.isOpen}
        mode={state.mode}
        onClose={handleCloseModal}
        onChangeModalMode={handleChangeModalMode}
      />
    </LoginSignupModalContext.Provider>
  );
}
