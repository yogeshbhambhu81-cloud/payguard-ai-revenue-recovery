import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Copilot } from './components/Copilot';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Payments } from './pages/Payments';
import { FailedPayments } from './pages/FailedPayments';
import { Customers } from './pages/Customers';
import { Recovery } from './pages/Recovery';
import { Settings } from './pages/Settings';
import { FailureAnalysis } from './pages/FailureAnalysis';

const Layout = ({ children, onOpenCopilot }) => {
  return (
    <div className="h-screen bg-[#0B0F17] flex flex-col overflow-hidden">
      <Navbar onOpenCopilot={onOpenCopilot} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  );
};

export function App() {
  const [copilotOpen, setCopilotOpen] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <Layout onOpenCopilot={() => setCopilotOpen(true)}>
                <Routes>
                  <Route path="/" element={<Dashboard onOpenCopilot={() => setCopilotOpen(true)} />} />
                  <Route path="/failure-analysis" element={<FailureAnalysis />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/failed-payments" element={<FailedPayments />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/recovery" element={<Recovery />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <Copilot isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
              </Layout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
