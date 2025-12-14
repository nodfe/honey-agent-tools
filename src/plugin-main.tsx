import React from 'react'
import ReactDOM from 'react-dom/client'
import PluginWindow from './PluginWindow'
import './index.css'

ReactDOM.createRoot(document.getElementById('plugin-root')!).render(
  <React.StrictMode>
    <PluginWindow />
  </React.StrictMode>,
)
