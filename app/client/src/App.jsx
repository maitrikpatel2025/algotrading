import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import Footer from './components/Footer';
import Monitor from './pages/Monitor';
import Strategy from './pages/Strategy';
import Account from './pages/Account';

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-background">
        <NavigationBar />
        <main className="flex-1 container">
          <Routes>
            <Route path="/" element={<Navigate to="/monitor" replace />} />
            <Route exact path="/monitor" element={<Monitor />} />
            <Route exact path="/strategy" element={<Strategy />} />
            <Route exact path="/account" element={<Account />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
