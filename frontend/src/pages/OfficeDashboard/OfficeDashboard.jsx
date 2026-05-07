import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import './OfficeDashboard.css';

function OfficeDashboard() {

  const stats = [
    { label: 'Total Prospects', value: '-', trend: '', color: '#c9a84c', bg: 'rgba(201,168,76,0.1)' },
    { label: 'Active Loans', value: '-', trend: '', color: '#27500a', bg: 'rgba(39,80,10,0.08)' },
    { label: 'Appointments', value: '-', trend: '', color: '#0c447c', bg: 'rgba(12,68,124,0.08)' },
    { label: 'Team Members', value: '-', trend: '', color: '#0a1628', bg: 'rgba(10,22,40,0.06)' },
  ];

  return (
    <div className="page-wrapper">
      <Sidebar active="Dashboard" />
      <div className="page-main">
        <Topbar />

        <div className="page-content">
          <div className="page-header">
            <div className="page-header-left">
              <h1 className="page-title">Dashboard</h1>
              <span className="page-subtitle">Welcome back</span>
            </div>
          </div>

          <div className="db-stats">
            {stats.map((stat) => (
              <div className="stat-card" key={stat.label} style={{ '--ac': stat.color, '--ac-bg': stat.bg }}>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-trend">{stat.trend}</div>
              </div>
            ))}
          </div>

          <div className="db-grid">
            <div className="db-panel">
              <div className="db-panel-hd">
                <span className="db-panel-title">Recent Prospects</span>
                <span className="db-panel-link">View all →</span>
              </div>
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Prospect</th><th>Source</th><th>Status</th><th>LO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="4" className="db-empty-row">
                      No prospects yet
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="db-panel">
              <div className="db-panel-hd">
                <span className="db-panel-title">Upcoming Appointments</span>
                <span className="db-panel-link">View all →</span>
              </div>
              <div className="db-empty-block">
                No appointments yet
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfficeDashboard;