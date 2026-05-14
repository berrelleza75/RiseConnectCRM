import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import './OfficeProfile.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const EMPTY = {
    name: '', phone: '', email: '', address: '',
    city: '', state: '', zip: '', website: '',
    nmls_id: '', license_number: '', logo_url: '',
};

function Field({ label, children }) {
    return (
        <div className="op-field">
            <label className="op-label">{label}</label>
            {children}
        </div>
    );
}

export default function OfficeProfile() {
    const token    = localStorage.getItem('token');
    const payload  = token ? JSON.parse(atob(token.split('.')[1])) : {};
    const officeId = payload.office_id;

    const [office,  setOffice]  = useState(null);
    const [form,    setForm]    = useState(EMPTY);
    const [loading, setLoading] = useState(true);
    const [saving,  setSaving]  = useState(false);
    const [saved,   setSaved]   = useState(false);
    const [error,   setError]   = useState('');

    const [twilioNumbers,   setTwilioNumbers]   = useState(null);
    const [loadingTwilio,   setLoadingTwilio]   = useState(false);
    const [twilioError,     setTwilioError]     = useState('');
    const [showAvailable,   setShowAvailable]   = useState(false);

    useEffect(() => {
        if (!officeId) return;
        fetch(`${API_URL}/offices/${officeId}`)
            .then(r => r.json())
            .then(data => {
                setOffice(data);
                setForm({ ...EMPTY, ...data });
            })
            .catch(() => setError('Could not load office info.'))
            .finally(() => setLoading(false));
    }, [officeId]);

    const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

    const loadTwilioNumbers = () => {
        setLoadingTwilio(true);
        setTwilioError('');
        fetch(`${API_URL}/offices/twilio/numbers`)
            .then(r => r.json())
            .then(data => { setTwilioNumbers(data); })
            .catch(() => setTwilioError('Could not load Twilio numbers.'))
            .finally(() => setLoadingTwilio(false));
    };

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        setError('');
        try {
            const res  = await fetch(`${API_URL}/offices/${officeId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setOffice(data);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError(err.message || 'Failed to save.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-wrapper">
            <Sidebar active="Office" />
            <div className="page-main">
                <Topbar />
                <div className="page-content">

                    <div className="page-header">
                        <div className="page-header-left">
                            <h1 className="page-title">Office Profile</h1>
                            <span className="page-subtitle">Manage your office information</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="op-loading">Loading...</div>
                    ) : (
                        <div className="op-layout">

                            {/* ── Left: Office form ── */}
                            <div className="op-card">
                                <div className="op-hero">
                                    <div className="op-avatar">
                                        {form.logo_url
                                            ? <img src={form.logo_url} alt="logo" className="op-logo-img" />
                                            : <span>{(form.name || 'O')[0].toUpperCase()}</span>
                                        }
                                    </div>
                                    <div>
                                        <div className="op-hero-name">{office?.name || '—'}</div>
                                        {office?.nmls_id && <div className="op-hero-nmls">NMLS #{office.nmls_id}</div>}
                                    </div>
                                </div>

                                {error && <div className="op-error">{error}</div>}

                                <div className="op-section-title">General Information</div>
                                <div className="op-grid2">
                                    <Field label="Office Name">
                                        <input className="op-input" value={form.name} onChange={set('name')} placeholder="Office name" />
                                    </Field>
                                    <Field label="Phone">
                                        <input className="op-input" value={form.phone} onChange={set('phone')} placeholder="Phone number" />
                                    </Field>
                                    <Field label="Email">
                                        <input className="op-input" type="email" value={form.email} onChange={set('email')} placeholder="office@email.com" />
                                    </Field>
                                    <Field label="Website">
                                        <input className="op-input" value={form.website} onChange={set('website')} placeholder="https://..." />
                                    </Field>
                                </div>

                                <div className="op-section-title">Address</div>
                                <div className="op-grid2">
                                    <Field label="Street Address">
                                        <input className="op-input" value={form.address} onChange={set('address')} placeholder="123 Main St" />
                                    </Field>
                                    <Field label="City">
                                        <input className="op-input" value={form.city} onChange={set('city')} placeholder="City" />
                                    </Field>
                                    <Field label="State">
                                        <input className="op-input" value={form.state} onChange={set('state')} placeholder="State" />
                                    </Field>
                                    <Field label="ZIP Code">
                                        <input className="op-input" value={form.zip} onChange={set('zip')} placeholder="ZIP" />
                                    </Field>
                                </div>

                                <div className="op-section-title">Licensing</div>
                                <div className="op-grid2">
                                    <Field label="NMLS ID">
                                        <input className="op-input" value={form.nmls_id} onChange={set('nmls_id')} placeholder="NMLS #" />
                                    </Field>
                                    <Field label="License Number">
                                        <input className="op-input" value={form.license_number} onChange={set('license_number')} placeholder="State license #" />
                                    </Field>
                                </div>

                                <div className="op-section-title">Branding</div>
                                <Field label="Logo URL">
                                    <input className="op-input" value={form.logo_url} onChange={set('logo_url')} placeholder="https://... (link to logo image)" />
                                </Field>

                                <div className="op-footer">
                                    {saved && <span className="op-saved">✓ Changes saved</span>}
                                    <button className="op-save-btn" onClick={handleSave} disabled={saving}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>

                            {/* ── Right: Twilio panel ── */}
                            <div className="op-twilio-panel">
                                <div className="op-twilio-panel-title">
                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                                    </svg>
                                    Twilio Phone Numbers
                                </div>

                                {!twilioNumbers ? (
                                    <div className="op-twilio-empty-state">
                                        <p>View and manage your Twilio phone numbers</p>
                                        <button className="op-twilio-btn" onClick={loadTwilioNumbers} disabled={loadingTwilio}>
                                            {loadingTwilio ? 'Loading...' : 'Load Numbers'}
                                        </button>
                                        {twilioError && <div className="op-error" style={{marginTop:10}}>{twilioError}</div>}
                                    </div>
                                ) : (
                                    <div className="op-twilio-wrap">
                                        <div className="op-twilio-sub">Active Numbers</div>
                                        {twilioNumbers.current.length === 0 && <div className="op-twilio-empty">No numbers on this account</div>}
                                        {twilioNumbers.current.map(n => (
                                            <div key={n.sid} className="op-twilio-number active">
                                                <div className="op-twilio-num">{n.phoneNumber}</div>
                                                <div className="op-twilio-caps">
                                                    {n.capabilities?.voice && <span className="op-cap">Voice</span>}
                                                    {n.capabilities?.SMS   && <span className="op-cap">SMS</span>}
                                                    {n.capabilities?.MMS   && <span className="op-cap">MMS</span>}
                                                </div>
                                            </div>
                                        ))}

                                        <button className="op-twilio-toggle" onClick={() => setShowAvailable(s => !s)}>
                                            {showAvailable ? '▲ Hide available numbers' : '▼ Browse numbers to purchase'}
                                        </button>

                                        {showAvailable && (
                                            <>
                                                <div className="op-twilio-sub" style={{ marginTop: 14 }}>Available Numbers (US)</div>
                                                {twilioNumbers.available.map(n => (
                                                    <div key={n.phoneNumber} className="op-twilio-number available">
                                                        <div>
                                                            <div className="op-twilio-num">{n.phoneNumber}</div>
                                                            <div className="op-twilio-loc">{n.locality}, {n.region} · {n.monthlyFee}</div>
                                                        </div>
                                                        <div className="op-twilio-caps">
                                                            {n.capabilities?.voice && <span className="op-cap">Voice</span>}
                                                            {n.capabilities?.SMS   && <span className="op-cap">SMS</span>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
