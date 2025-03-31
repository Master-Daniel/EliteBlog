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

const GoogleOAuth: React.FC<{ clientId: string; children: React.ReactNode }> =
  GoogleOAuthProvider as unknown as React.FC<{ clientId: string; children: React.ReactNode }>;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <GoogleOAuth clientId={import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID}>
            <RouterProvider router={routes} />
            <Toaster />
          </GoogleOAuth>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  </StrictMode>,
)
