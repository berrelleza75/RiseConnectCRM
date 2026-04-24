import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import RegisterOffice from './pages/RegisterOffice/RegisterOffice';
import RegisterRealtor from './pages/RegisterRealtor/RegisterRealtor';
import Dashboard from './pages/Dashboard/Dashboard';
import Prospects from './pages/Prospects/Prospects';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register/office" element={<RegisterOffice />} />
        <Route path="/register/realtor" element={<RegisterRealtor />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/prospects" element={<Prospects />} />
      </Routes>
    </Router>
  );
}

export default App;