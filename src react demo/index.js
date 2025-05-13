import React from 'react';
import ReactDOM from 'react-dom/client'; // For React 18
import App from './App'; // Adjust the import based on your app structure

const root = ReactDOM.createRoot(document.getElementById('root')); // Ensure 'root' matches the id in index.html
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
