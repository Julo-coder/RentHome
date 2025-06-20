import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import App from "./App"
import './styles/index.css';
import Modal from 'react-modal';

// Set the app element once at the application root level
Modal.setAppElement('#root');

const root = createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
