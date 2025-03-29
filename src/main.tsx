import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import './style.css';
import algoliasearch from 'algoliasearch';
import routes from "./routes";
import { persistor, store } from './redux/store';
import { PersistGate } from "redux-persist/integration/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { InstantSearch } from 'react-instantsearch-hooks-web';
import { HelmetProvider } from 'react-helmet-async';

// Create clients
const queryClient = new QueryClient();
const searchClient = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID,
  import.meta.env.VITE_ALGOLIA_API_KEY
);

const GoogleOAuth: React.FC<{ clientId: string; children: React.ReactNode }> =
  GoogleOAuthProvider as unknown as React.FC<{ clientId: string; children: React.ReactNode }>;

const InstantSearchProvider: React.FC<{
  searchClient: unknown;
  indexName: string;
  children: React.ReactNode;
}> = InstantSearch as unknown as React.FC<{
  searchClient: unknown;
  indexName: string;
  children: React.ReactNode;
}>;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <GoogleOAuth clientId={import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID}>
            <InstantSearchProvider searchClient={searchClient} indexName="YOUR_INDEX_NAME">
              <HelmetProvider>
                <RouterProvider router={routes} />
                <Toaster />
              </HelmetProvider>
            </InstantSearchProvider>
          </GoogleOAuth>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  </StrictMode>,
)
