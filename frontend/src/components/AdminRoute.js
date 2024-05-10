import React, { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Store } from '../Store';
import jwtDecode from 'jwt-decode';

export default function AdminRoute({ children }) {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  useEffect(() => {
    if (userInfo && userInfo.token) {
      const decodedToken = jwtDecode(userInfo.token);
      if (decodedToken.exp * 1000 < Date.now()) {
        ctxDispatch({ type: 'USER_SIGNOUT' });
        localStorage.removeItem('userInfo');
        window.location.href = '/';
      }
    }
  }, [userInfo, children, ctxDispatch]);
  return userInfo && userInfo.role === 'ADMIN' ? children : <Navigate to="/" />;
}
