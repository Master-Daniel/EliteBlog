import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router-dom";
// import './tailwind.css';
import './style.css';
import routes from "./routes";
import BlogProvider from './context/provider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BlogProvider>
      <RouterProvider router={routes} />
    </BlogProvider>
  </StrictMode>,
)
