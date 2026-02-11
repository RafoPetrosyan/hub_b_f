'use client';

import React, { useRef } from 'react';
import { AppStore, makeStore } from '@/store/store';
import { Provider } from 'react-redux';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore>(undefined);

  // eslint-disable-next-line react-hooks/refs
  if (!storeRef.current) storeRef.current = makeStore();

  // eslint-disable-next-line react-hooks/refs
  return <Provider store={storeRef.current}>{children}</Provider>;
}
