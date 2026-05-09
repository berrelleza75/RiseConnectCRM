import React, { useState } from 'react';
import './Topbar.css';
import Dialer from '../Dialer/Dialer';

function Topbar() {
    const [dialerOpen, setDialerOpen] = useState(false);

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
                <div className="topbar-notif">
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="#9a8f80">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 16a2 2 0 002-2H8a2 2 0 002 2z"/>
                    </svg>
                    <div className="topbar-notif-dot"></div>
                </div>
                <button className="topbar-cta">New Updates</button>
            </div>
        </div>

        {dialerOpen && <Dialer onClose={() => setDialerOpen(false)} />}
        </>
    );
}

export default Topbar;
