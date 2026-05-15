import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import axios from 'axios'
import App from './App.jsx'
import './index.css'

// Detect environment: Local vs Vercel
const defaultBaseURL = 'http://localhost:5000';
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL || defaultBaseURL;

// Debug log for production help
console.log('API Base URL:', axios.defaults.baseURL);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)
