import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import routes from "./routes";
import { persistor, store } from './redux/store';
import { PersistGate } from "redux-persist/integration/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Create clients
const queryClient = new QueryClient();

const googleClientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID as string | undefined;
const GoogleOAuth: React.FC<{ clientId: string; children: React.ReactNode }> =
  GoogleOAuthProvider as unknown as React.FC<{ clientId: string; children: React.ReactNode }>;

const app = (
  <RouterProvider router={routes} />
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          {googleClientId ? (
            <GoogleOAuth clientId={googleClientId}>
              {app}
              <Toaster />
            </GoogleOAuth>
          ) : (
            <>
              {app}
              <Toaster />
            </>
          )}
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  </StrictMode>,
)
