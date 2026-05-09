import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import RegisterOffice from './pages/RegisterOffice/RegisterOffice';
import OfficeDashboard from './pages/OfficeDashboard/OfficeDashboard';
import Contacts from './pages/Contacts/Contacts';
import Leads from './pages/Leads/Leads';
import LeadDetail from './pages/Leads/LeadDetail';
import Loans from './pages/Loans/Loans';
import LoanDetail from './pages/Loans/LoanDetail';
import Messages from './pages/Messages/Messages';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register/office" element={<RegisterOffice />} />
        <Route path="/office/dashboard" element={<OfficeDashboard />} />
        <Route path="/office/contacts" element={<Contacts />} />
        <Route path="/office/leads" element={<Leads />} />
        <Route path="/office/leads/:id" element={<LeadDetail />} />
        <Route path="/office/loans" element={<Loans />} />
        <Route path="/office/loans/:id" element={<LoanDetail />} />
        <Route path="/office/messages" element={<Messages />} />
      </Routes>
    </Router>
  );
}

export default App;