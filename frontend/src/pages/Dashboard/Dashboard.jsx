import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Dashboard.css';

function Dashboard() {

  const stats = [
    { label: 'Total Prospects', value: '-', trend: '', color: '#c9a84c', bg: 'rgba(201,168,76,0.1)' },
    { label: 'Active Loans', value: '-', trend: '', color: '#27500a', bg: 'rgba(39,80,10,0.08)' },
    { label: 'Appointments', value: '-', trend: '', color: '#0c447c', bg: 'rgba(12,68,124,0.08)' },
    { label: 'Team Members', value: '-', trend: '', color: '#0a1628', bg: 'rgba(10,22,40,0.06)' },
  ];

  return (
    <div className="dashboard-wrapper">
      <Sidebar active="Dashboard" />
      <div className="dashboard-main">
        <div className="db-topbar">
            <div/>
          <div className="db-topbar-right">
            <div className="db-notif">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="#9a8f80">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 16a2 2 0 002-2H8a2 2 0 002 2z"/>
              </svg>
              <div className="db-notif-dot"></div>
            </div>
            <button className="db-cta">+ New Prospect</button>
          </div>
        </div>

        <div className="db-content">
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
                    <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: '#9a8f80', fontSize: '13px' }}>
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
              <div style={{ textAlign: 'center', padding: '24px', color: '#9a8f80', fontSize: '13px' }}>
                No appointments yet
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;