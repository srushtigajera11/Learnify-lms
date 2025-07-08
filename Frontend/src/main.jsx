import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import { AuthProvider } from './Context/authContext';
// import store from './store';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
    <AuthProvider>
    <App />
    </AuthProvider>
    </React.StrictMode>
);
