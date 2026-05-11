import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Topbar.css';
import Dialer from '../Dialer/Dialer';

function Topbar() {
    const [dialerOpen, setDialerOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <>
        <div className="topbar">
            <div className="topbar-left"></div>
            <div className="topbar-right">
                <button
                    className={`topbar-phone-btn ${dialerOpen ? 'active' : ''}`}
                    onClick={() => setDialerOpen(o => !o)}
                    title="Dialer"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
                    </svg>
                </button>
                <button className="topbar-logout-btn" onClick={handleLogout} title="Sign out">
                    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
                    </svg>
                    Sign out
                </button>
            </div>
        </div>

        {dialerOpen && <Dialer onClose={() => setDialerOpen(false)} />}
        </>
    );
}

export default Topbar;
