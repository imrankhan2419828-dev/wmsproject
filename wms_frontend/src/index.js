//import React from 'react';
//import ReactDOM from 'react-dom/client';
//import './index.css';
//import App from './App';
//import reportWebVitals from './reportWebVitals';
//import 'bootstrap/dist/css/bootstrap.min.css';
//import './assets/css/shared.css';
//import { AuthProvider } from "./context/AuthContext";
//import './layout/layout.css';
//const root = ReactDOM.createRoot(document.getElementById('root'));
//root.render(
//    <React.StrictMode>
//        <AuthProvider>
//            <App />
//        </AuthProvider>
//    </React.StrictMode>
//);

//reportWebVitals();
import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';

// ========== EXISTING IMPORTS (Keep) ==========
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/css/shared.css';
import './layout/layout.css';

// ========== NEW IMPORTS (Add) ==========
import './styles/main.scss';  // Centralized SCSS (will override where needed)

// ========== MAIN APP ==========
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

reportWebVitals();