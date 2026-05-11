import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import './OfficeDashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function statusBadgeClass(status) {
    const map = {
        new: 'db-badge-new',
        working: 'db-badge-working',
        qualified: 'db-badge-qualified',
        converted: 'db-badge-converted',
        lost: 'db-badge-lost',
    };
    return map[status] || 'db-badge-new';
}

function OfficeDashboard() {
    const [activeLeads, setActiveLeads]   = useState('—');
    const [activeLoans, setActiveLoans]   = useState('—');
    const [recentLeads, setRecentLeads]   = useState([]);

    useEffect(() => {
        fetch(`${API_URL}/leads/stats`)
            .then(r => r.json())
            .then(d => { setActiveLeads(d.active); setRecentLeads(d.recent || []); })
            .catch(() => {});

        fetch(`${API_URL}/loans/stats`)
            .then(r => r.json())
            .then(d => setActiveLoans(d.active))
            .catch(() => {});
    }, []);

    const stats = [
        { label: 'Active Leads', value: activeLeads, color: '#c9a84c', bg: 'rgba(201,168,76,0.1)' },
        { label: 'Active Loans', value: activeLoans, color: '#27500a', bg: 'rgba(39,80,10,0.08)' },
        { label: 'Appointments', value: '—',         color: '#0c447c', bg: 'rgba(12,68,124,0.08)' },
        { label: 'Team Members', value: '—',         color: '#0a1628', bg: 'rgba(10,22,40,0.06)' },
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
                            </div>
                        ))}
                    </div>

                    <div className="db-grid">
                        <div className="db-panel">
                            <div className="db-panel-hd">
                                <span className="db-panel-title">Recent Leads</span>
                                <a className="db-panel-link" href="/office/leads">View all →</a>
                            </div>
                            <table className="db-table">
                                <thead>
                                    <tr>
                                        <th>Contact</th>
                                        <th>Purpose</th>
                                        <th>Source</th>
                                        <th>Status</th>
                                        <th>LO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentLeads.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="db-empty-row">No leads yet</td>
                                        </tr>
                                    ) : recentLeads.map(lead => (
                                        <tr key={lead.id}>
                                            <td>{lead.contact_first_name} {lead.contact_last_name}</td>
                                            <td>{lead.loan_purpose || '—'}</td>
                                            <td>{lead.contact_source || '—'}</td>
                                            <td>
                                                <span className={`db-badge ${statusBadgeClass(lead.status)}`}>
                                                    {lead.status}
                                                </span>
                                            </td>
                                            <td>
                                                {lead.assigned_first_name
                                                    ? `${lead.assigned_first_name} ${lead.assigned_last_name}`
                                                    : '—'}
                                            </td>
                                        </tr>
                                    ))}
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
