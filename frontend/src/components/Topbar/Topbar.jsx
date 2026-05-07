import React from 'react';
import './Topbar.css';

function Topbar() {
    return (
        <div className="topbar">
            <div className="topbar-left"></div>
            <div className="topbar-right">
                <div className="topbar-notif">
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="#9a8f80">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 16a2 2 0 002-2H8a2 2 0 002 2z"/>
                    </svg>
                    <div className="topbar-notif-dot"></div>
                </div>
                <button className="topbar-cta">New Updates</button>
            </div>
        </div>
    );
}

export default Topbar;