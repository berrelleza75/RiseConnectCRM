import React, { useState } from 'react';
import './Sidebar.css';

const navItems = [
  {
    section: 'Workspace',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: 'grid' },
      { label: 'Prospects', path: '/dashboard/prospects', icon: 'users' },
      { label: 'Pipeline', path: '/dashboard/pipeline', icon: 'pipeline' },
    ]
  },
  {
    section: 'Communication',
    items: [
      { label: 'Messages', path: '/dashboard/messages', icon: 'chat' },
      { label: 'Calendar', path: '/dashboard/calendar', icon: 'calendar' },
      { label: 'Calls', path: '/dashboard/calls', icon: 'phone' },
    ]
  },
  {
    section: 'Office',
    items: [
      { label: 'Team', path: '/dashboard/team', icon: 'team' },
      { label: 'Settings', path: '/dashboard/settings', icon: 'settings' },
    ]
  }
];

function Sidebar({ active }) {
  const [collapsed, setCollapsed] = useState(false);
  const token = localStorage.getItem('token');
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : {};
  const initials = payload.first_name && payload.last_name
    ? `${payload.first_name[0]}${payload.last_name[0]}`
    : 'U';

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sb-head">
        <div className="sb-logo">
          
          <div className="sb-brand-txt">
            <div className="sb-brand-name">Rise<em>Connect</em></div>
            <div className="sb-brand-tag">{payload.first_name} {payload.last_name}</div>
          </div>
        </div>
        <button className="sb-toggle" onClick={() => setCollapsed(!collapsed)}>
          <ChevronIcon />
        </button>
      </div>

      <nav className="sb-nav">
        {navItems.map((group) => (
          <div className="sb-section" key={group.section}>
            <div className="sb-section-label">{group.section}</div>
            {group.items.map((item) => (
              <div
                key={item.label}
                className={`sb-item ${active === item.label ? 'on' : ''}`}
              >
                <SbIcon name={item.icon} />
                <span className="sb-lbl">{item.label}</span>
              </div>
            ))}
          </div>
        ))}
      </nav>

      <div className="sb-footer">
        <div className="sb-user">
          <div className="sb-av">{initials}</div>
          <div className="sb-uinfo">
            <div className="sb-uname">{payload.first_name} {payload.last_name}</div>
            <div className="sb-urole">Administrator</div>
          </div>
          <LogoutIcon />
        </div>
      </div>
    </aside>
  );
}

function SbIcon({ name }) {
  const icons = {
    grid: <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 8a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zm6-8a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zm0 8a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z"/>,
    users: <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>,
    pipeline: <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd"/>,
    chat: <><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/></>,
    calendar: <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>,
    phone: <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>,
    team: <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>,
    settings: <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>,
  };
  return (
    <svg className="sb-ic" fill="currentColor" viewBox="0 0 20 20">
      {icons[name]}
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="7,1.5 3,5 7,8.5"/>
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="sb-logout" width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
    </svg>
  );
}

export default Sidebar;