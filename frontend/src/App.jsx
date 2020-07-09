import React from 'react';
import UserContext from './contexts/user';
import UserContextProvider from './contexts/UserContextProvider';
import LoginSignupModalProvider from './contexts/LoginSignupModalProvider';
import Header from './components/Header';

import './styles/app.scss';

export default function App() {
  return (
    <UserContextProvider>
      <UserContext.Consumer>
        {(user) => (
          <LoginSignupModalProvider>
            {console.log(user)}
            <Header {...user} />
          </LoginSignupModalProvider>
        )}
      </UserContext.Consumer>
    </UserContextProvider>
  );
}
