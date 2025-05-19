import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter, BrowserRouter as Router } from 'react-router-dom';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
        <MantineProvider   defaultColorScheme="light"
        >
            <App />
          
     
    </MantineProvider>
  </StrictMode>
);
