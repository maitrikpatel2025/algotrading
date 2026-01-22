import React from 'react';
import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import Footer from './components/Footer';
import Monitor from './pages/Monitor';
import Strategy from './pages/Strategy';
import StrategyLibrary from './pages/StrategyLibrary';
import BacktestLibrary from './pages/BacktestLibrary';
import BacktestConfiguration from './pages/BacktestConfiguration';
import Account from './pages/Account';

/**
 * AppLayout - Precision Swiss Design System
 *
 * Clean layout with white navigation, neutral-50 background.
 * Footer hidden on builder pages for maximum workspace.
 */
function AppLayout({ children }) {
  const location = useLocation();
  // Hide footer on builder/configuration pages for more workspace
  const isBuilderPage = (location.pathname.includes('/strategies/') &&
    (location.pathname.includes('/edit') || location.pathname.includes('/new'))) ||
    (location.pathname.includes('/backtests/') &&
    (location.pathname.includes('/edit') || location.pathname.includes('/new')));

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <NavigationBar />
      <main className={isBuilderPage ? "flex-1 flex flex-col" : "flex-1"}>
        {children}
      </main>
      {!isBuilderPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/strategies" replace />} />
          {/* Strategies - Library and Builder */}
          <Route path="/strategies" element={<StrategyLibrary />} />
          <Route path="/strategies/new" element={<Strategy />} />
          <Route path="/strategies/:id/edit" element={<Strategy />} />
          {/* Legacy route redirect */}
          <Route path="/strategy" element={<Navigate to="/strategies" replace />} />
          {/* Backtests - Library and Configuration */}
          <Route path="/backtests" element={<BacktestLibrary />} />
          <Route path="/backtests/new" element={<BacktestConfiguration />} />
          <Route path="/backtests/:id/edit" element={<BacktestConfiguration />} />
          {/* Other pages */}
          <Route path="/monitor" element={<Monitor />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
