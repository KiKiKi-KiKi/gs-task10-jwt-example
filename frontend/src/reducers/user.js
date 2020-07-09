import { LOGIN_USER, LOGOUT_USER } from '../actions/user';

/*
state = {
  user: {
    id,
    name,
  }
}
*/

export const USER_INITIAL_STATE = {
  user: {},
};

const reducer = (state, action) => {
  switch (action.type) {
    case LOGIN_USER: {
      const { user, name } = action.payload.user;

      return {
        ...state,
        isAuthenticated: action.payload.authenticated,
        user: {
          id: user,
          name,
        },
      };
    }
    case LOGOUT_USER: {
      const { user, name } = action.payload.user;

      return {
        ...state,
        isAuthenticated: action.payload.authenticated,
        user: {
          id: user,
          name,
        },
      };
    }
    default: {
      return state;
    }
  }
};

export default reducer;
