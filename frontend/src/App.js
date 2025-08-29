import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import PricingPage from './pages/PricingPage';
import AdminPage from './pages/AdminPage';
// import LoginPage from './pages/LoginPage';

function App() {
  const isAdmin = true;

  return (
    <Router>
        <Routes>
            {/* مسیرهای داخل داشبورد */}
            <Route path="/" element={<DashboardLayout><DashboardPage /></DashboardLayout>} />
            <Route path="/pricing" element={<DashboardLayout><PricingPage /></DashboardLayout>} />

            {/* مسیر محافظت شده برای ادمین */}
            <Route
                path="/admin"
                element={
                    isAdmin ? (
                        <DashboardLayout><AdminPage /></DashboardLayout>
                    ) : (
                        <Navigate to="/" />
                    )
                }
            />

            {/* <Route path="/login" element={<LoginPage />} /> */}
        </Routes>
    </Router>
  );
}

export default App;