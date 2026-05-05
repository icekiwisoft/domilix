import { Suspense } from 'react';

import ResetPassword from '@pages/ResetPassword/ResetPassword';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPassword />
    </Suspense>
  );
}
