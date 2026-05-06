import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Sync dark mode with system preference
const mq = window.matchMedia('(prefers-color-scheme: dark)');
const applyDark = (dark) => document.documentElement.classList.toggle('dark', dark);
applyDark(mq.matches);
mq.addEventListener('change', (e) => applyDark(e.matches));

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}