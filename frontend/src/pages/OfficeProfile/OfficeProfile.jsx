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
                        <div className="op-card">

                            {/* Office avatar / logo */}
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

                            {/* Form sections */}
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
                    )}
                </div>
            </div>
        </div>
    );
}
