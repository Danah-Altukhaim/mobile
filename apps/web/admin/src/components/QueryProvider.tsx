'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );
  // QueryClientProvider's children type may resolve to a narrower @types/react
  // than this app's. Cast to align without forcing a workspace-wide types upgrade.
  return <QueryClientProvider client={client}>{children as never}</QueryClientProvider>;
}
