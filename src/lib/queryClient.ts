// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

// Create a client
export const createQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  });

  // Set up local storage persistence for the query client
  const persister = createSyncStoragePersister({
    storage: window.localStorage,
    key: 'app-cache', // Storage key prefix
    throttleTime: 1000, // How frequently to persist cache to storage
  });

  // Persist the query client
  persistQueryClient({
    queryClient,
    persister,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    // Only persist certain queries
    dehydrateOptions: {
      shouldDehydrateQuery: (query) => {
        // Only persist auth and user data
        return (
          query.queryKey[0] === 'auth' ||
          query.queryKey[0] === 'user'
        );
      },
    },
  });

  return queryClient;
};