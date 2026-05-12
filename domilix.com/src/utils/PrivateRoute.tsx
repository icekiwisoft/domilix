import React from 'react';
import { Navigate, useLocation } from '@router';

import { useAuthStore } from '@stores/defineStore';

export default function PrivateRoute({ children }: React.PropsWithChildren) {
  const authData = useAuthStore(state => state.authData);
  const location = useLocation();

  if (authData.status == 'unknow') return null;
  if (authData.status !== 'logged') {
    return <Navigate to='/401' state={{ from: location }} />;
  }
  return <>{children}</>;
}
