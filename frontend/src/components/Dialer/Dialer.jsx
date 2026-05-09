import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Device } from '@twilio/voice-sdk';
import './Dialer.css';

const API_URL    = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const VALID_KEYS = new Set(['0','1','2','3','4','5','6','7','8','9','*','#','+']);
const DIAL_KEYS  = [['1','2','3'],['4','5','6'],['7','8','9'],['*','0','#']];

// Auto-adds +52 for 10-digit Mexican numbers
const formatNumber = (n) => {
    const trimmed = n.trim();
    if (trimmed.startsWith('+')) return trimmed;
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length === 10) return `+52${digits}`;
    if (digits.length === 0) return '';
    return `+${digits}`;
};

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function Dialer({ onClose, initialNumber = '' }) {
    const [number, setNumber]       = useState(initialNumber);
    const [status, setStatus]       = useState('loading');
    const [statusMsg, setStatusMsg] = useState('Connecting...');
    const [duration, setDuration]   = useState(0);
    const deviceRef = useRef(null);
    const callRef   = useRef(null);

    // ── Timer: starts/resets based on status ─────────────
    useEffect(() => {
        if (status !== 'active') {
            setDuration(0);
            return;
        }
        setDuration(0);
        const id = setInterval(() => setDuration(d => d + 1), 1000);
        return () => clearInterval(id);
    }, [status]);

    // ── Init Voice SDK ────────────────────────────────────
    useEffect(() => {
        let mounted = true;
        const init = async () => {
            try {
                const res  = await fetch(`${API_URL}/calls/token`);
                const data = await res.json();
                if (!mounted) return;
                if (!res.ok) throw new Error(data.message);

                const device = new Device(data.token, { logLevel: 1 });

                device.on('registered', () => {
                    if (!mounted) return;
                    setStatus('ready');
                    setStatusMsg('Ready');
                });
                device.on('error', (err) => {
                    if (!mounted) return;
                    setStatus('error');
                    setStatusMsg(err.message || 'Device error');
                });

                await device.register();
                if (mounted) deviceRef.current = device;
            } catch (err) {
                if (!mounted) return;
                setStatus('error');
                setStatusMsg(err.message || 'Could not connect to Twilio');
            }
        };
        init();
        return () => {
            mounted = false;
            deviceRef.current?.destroy();
        };
    }, []);

    // ── Keyboard support ──────────────────────────────────
    const handleKeyDown = useCallback((e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (VALID_KEYS.has(e.key)) { setNumber(n => n + e.key); return; }
        if (e.key === 'Backspace')  { setNumber(n => n.slice(0, -1)); return; }
        if (e.key === 'Escape')     { onClose(); return; }
        if (e.key === 'Enter') {
            if (callRef.current) handleHangUp();
            else if (status === 'ready') handleCall();
        }
    }, [status, onClose]); // eslint-disable-line

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // ── Call actions ──────────────────────────────────────
    const handleCall = async () => {
        const to = formatNumber(number);
        if (!to || !deviceRef.current || status !== 'ready') return;
        try {
            setStatus('calling');
            setStatusMsg(`Calling ${to}...`);

            const call = await deviceRef.current.connect({ params: { To: to } });
            callRef.current = call;

            call.on('accept', () => {
                setStatus('active');
                setStatusMsg('On call');
            });
            call.on('disconnect', () => {
                callRef.current = null;
                setStatus('ready');
                setStatusMsg('Call ended');
                setTimeout(() => setStatusMsg('Ready'), 2000);
            });
            call.on('error', (err) => {
                callRef.current = null;
                setStatus('ready');
                setStatusMsg(err.message || 'Call error');
                setTimeout(() => setStatusMsg('Ready'), 3000);
            });
        } catch (err) {
            setStatus('ready');
            setStatusMsg(err.message || 'Call failed');
            setTimeout(() => setStatusMsg('Ready'), 3000);
        }
    };

    const handleHangUp = () => {
        callRef.current?.disconnect();
        callRef.current = null;
        setStatus('ready');
        setStatusMsg('Ready');
    };

    const pressKey = (key) => {
        if (status !== 'calling' && status !== 'active') setNumber(n => n + key);
    };

    const isBusy  = status === 'calling' || status === 'active';
    const canCall = status === 'ready' && number.trim().length > 0;
    const preview = !isBusy && number.trim().length > 0 ? formatNumber(number) : '';

    return (
        <div className="dialer-backdrop" onClick={onClose}>
            <div className="dialer" onClick={e => e.stopPropagation()}>

                <div className="dialer-header">
                    <span className="dialer-title">Dialer</span>
                    <button className="dialer-close" onClick={onClose}>×</button>
                </div>

                <div className={`dialer-status dialer-status-${status}`}>
                    <span className="dialer-status-dot" />
                    <span>{statusMsg}</span>
                </div>

                {status === 'active' && (
                    <div className="dialer-timer">{fmt(duration)}</div>
                )}

                <div className="dialer-display">
                    <input
                        className="dialer-number-input"
                        value={number}
                        onChange={e => !isBusy && setNumber(e.target.value)}
                        placeholder="Enter number"
                        autoFocus
                        readOnly={isBusy}
                    />
                    <button
                        className="dialer-backspace"
                        onClick={() => setNumber(n => n.slice(0, -1))}
                        disabled={!number || isBusy}
                        tabIndex={-1}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
                            <line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/>
                        </svg>
                    </button>
                </div>

                {preview && preview !== number.trim() && (
                    <div className="dialer-preview">{preview}</div>
                )}

                <div className="dialer-pad">
                    {DIAL_KEYS.map((row, i) => (
                        <div className="dialer-row" key={i}>
                            {row.map(key => (
                                <button key={key} className="dialer-key"
                                    onClick={() => pressKey(key)}
                                    disabled={isBusy} tabIndex={-1}>
                                    {key}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>

                <div className="dialer-actions">
                    {isBusy ? (
                        <button className="dialer-btn dialer-btn-hangup" onClick={handleHangUp}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
                            </svg>
                            Hang Up
                        </button>
                    ) : (
                        <button className="dialer-btn dialer-btn-call" onClick={handleCall} disabled={!canCall}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
                            </svg>
                            Call <span className="dialer-hint">↵</span>
                        </button>
                    )}
                </div>

                <div className="dialer-keyboard-hint">Keyboard: numbers · Backspace · Enter</div>
            </div>
        </div>
    );
}
