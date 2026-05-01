import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { inject } from '@vercel/analytics';
import App from './App';
import './index.css';

inject();

const router = createHashRouter([{ path: '/', element: <App /> }]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
