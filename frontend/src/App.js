import React from 'react';
import DashboardLayout from './components/DashboardLayout';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <DashboardLayout>
        <DashboardPage />
    </DashboardLayout>
  );
}

export default App;