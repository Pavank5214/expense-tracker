import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import axios from 'axios'
import App from './App.jsx'
import './index.css'

axios.defaults.baseURL = import.meta.env.VITE_API_URL || ''

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)
