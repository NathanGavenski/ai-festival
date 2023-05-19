import React, { lazy, Suspense } from 'react';

const LazyChat = lazy(() => import('./Chat'));

const Chat = props => (
  <Suspense fallback={null}>
    <LazyChat {...props} />
  </Suspense>
);

export default Chat;
