// client/src/App.tsx
import React from 'react';
import SearchPage from './components/Search/SearchPage';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <SearchPage />
    </div>
  );
};

export default App;