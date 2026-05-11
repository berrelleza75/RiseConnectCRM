import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import './Team.css';

function CustomSelect({ value, onChange, options }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selected = options.find(o => o.value === value);

    return (
        <div className="tcsel" ref={ref}>
            <button type="button" className={`tcsel-trigger ${open ? 'open' : ''}`} onClick={() => setOpen(o => !o)}>
                <span className="tcsel-value">{selected?.label || '— select —'}</span>
                <svg className={`tcsel-arrow ${open ? 'up' : ''}`} viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
            </button>
            {open && (
                <div className="tcsel-dropdown">
                    {options.map(o => (
                        <div key={o.value}
                            className={`tcsel-option ${o.value === value ? 'selected' : ''}`}
                            onClick={() => { onChange(o.value); setOpen(false); }}>
                            <span className={`tcsel-dot tcsel-dot-${o.value}`} />
                            {o.label}
                            {o.value === value && (
                                <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13" style={{marginLeft:'auto'}}>
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                </svg>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const ROLES = [
    { value: 'loan_officer', label: 'Loan Officer' },
    { value: 'realtor',      label: 'Realtor' },
];

const ROLE_LABELS = { admin: 'Admin', loan_officer: 'Loan Officer', realtor: 'Realtor' };

const EMPTY_FORM = {
    first_name: '', last_name: '', email: '', phone: '',
    role: 'loan_officer', password: '', confirm_password: '',
};

function initials(first, last) {
    return `${(first||'')[0]||''}${(last||'')[0]||''}`.toUpperCase();
}

export default function Team() {
    const token    = localStorage.getItem('token');
    const payload  = token ? JSON.parse(atob(token.split('.')[1])) : {};
    const officeId = payload.office_id;

    const [members, setMembers]   = useState([]);
    const [loading, setLoading]   = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing]   = useState(null);
    const [form, setForm]         = useState(EMPTY_FORM);
    const [saving, setSaving]     = useState(false);
    const [formError, setFormError] = useState('');

    const loadMembers = () => {
        setLoading(true);
        fetch(`${API_URL}/users?office_id=${officeId}`)
            .then(r => r.json())
            .then(setMembers)
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadMembers(); }, []);

    const openAdd = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        setFormError('');
        setModalOpen(true);
    };

    const openEdit = (member) => {
        if (member.role === 'admin') return;
        setEditing(member);
        setForm({
            first_name: member.first_name,
            last_name:  member.last_name,
            email:      member.email,
            phone:      member.phone || '',
            role:       member.role,
            password:   '',
            confirm_password: '',
        });
        setFormError('');
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!form.first_name || !form.last_name || !form.email || !form.role) {
            setFormError('First name, last name, email and role are required.');
            return;
        }
        if (!editing && !form.password) {
            setFormError('Password is required for new members.');
            return;
        }
        if (form.password && form.password !== form.confirm_password) {
            setFormError('Passwords do not match.');
            return;
        }
        setSaving(true);
        setFormError('');
        try {
            const body = { ...form, office_id: officeId };
            if (!form.password) delete body.password;
            delete body.confirm_password;

            const url    = editing ? `${API_URL}/users/${editing.id}` : `${API_URL}/users`;
            const method = editing ? 'PUT' : 'POST';
            const res    = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setModalOpen(false);
            loadMembers();
        } catch (err) {
            setFormError(err.message || 'Failed to save.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivate = async (member) => {
        if (member.role === 'admin') return;
        const action = member.status === 'active' ? 'inactive' : 'active';
        await fetch(`${API_URL}/users/${member.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...member, status: action }),
        });
        loadMembers();
    };

    const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

    const activeMembers   = members.filter(m => m.status === 'active');
    const inactiveMembers = members.filter(m => m.status !== 'active');

    return (
        <div className="page-wrapper">
            <Sidebar active="Team" />
            <div className="page-main">
                <Topbar />
                <div className="page-content">

                    <div className="page-header">
                        <div className="page-header-left">
                            <h1 className="page-title">Team</h1>
                            <span className="page-subtitle">{activeMembers.length} active member{activeMembers.length !== 1 ? 's' : ''}</span>
                        </div>
                        <button className="team-add-btn" onClick={openAdd}>+ Add Member</button>
                    </div>

                    {loading ? (
                        <div className="team-loading">Loading...</div>
                    ) : (
                        <>
                            <div className="team-grid">
                                {activeMembers.map(m => (
                                    <div key={m.id} className="team-card">
                                        <div className="team-card-top">
                                            <div className={`team-av team-av-${m.role}`}>{initials(m.first_name, m.last_name)}</div>
                                            <span className={`team-role-badge team-role-${m.role}`}>{ROLE_LABELS[m.role]}</span>
                                        </div>
                                        <div className="team-name">{m.first_name} {m.last_name}</div>
                                        <div className="team-email">{m.email}</div>
                                        {m.phone && <div className="team-phone">{m.phone}</div>}
                                        {m.role !== 'admin' && (
                                            <div className="team-actions">
                                                <button className="team-btn-edit" onClick={() => openEdit(m)}>Edit</button>
                                                <button className="team-btn-deact" onClick={() => handleDeactivate(m)}>Deactivate</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {inactiveMembers.length > 0 && (
                                <>
                                    <div className="team-section-title">Inactive Members</div>
                                    <div className="team-grid">
                                        {inactiveMembers.map(m => (
                                            <div key={m.id} className="team-card team-card-inactive">
                                                <div className="team-card-top">
                                                    <div className="team-av team-av-inactive">{initials(m.first_name, m.last_name)}</div>
                                                    <span className="team-role-badge team-role-inactive">{ROLE_LABELS[m.role]}</span>
                                                </div>
                                                <div className="team-name">{m.first_name} {m.last_name}</div>
                                                <div className="team-email">{m.email}</div>
                                                <div className="team-actions">
                                                    <button className="team-btn-edit" onClick={() => handleDeactivate(m)}>Reactivate</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ── Modal ── */}
            {modalOpen && (
                <div className="team-modal-backdrop" onClick={() => setModalOpen(false)}>
                    <div className="team-modal" onClick={e => e.stopPropagation()}>
                        <div className="team-modal-header">
                            <span>{editing ? 'Edit Member' : 'Add Team Member'}</span>
                            <button className="team-modal-close" onClick={() => setModalOpen(false)}>×</button>
                        </div>

                        <div className="team-modal-body">
                            {formError && <div className="team-form-error">{formError}</div>}

                            <div className="team-row2">
                                <div className="team-field">
                                    <label>First Name *</label>
                                    <input className="team-input" value={form.first_name} onChange={set('first_name')} placeholder="First name" autoFocus />
                                </div>
                                <div className="team-field">
                                    <label>Last Name *</label>
                                    <input className="team-input" value={form.last_name} onChange={set('last_name')} placeholder="Last name" />
                                </div>
                            </div>

                            <div className="team-field">
                                <label>Email *</label>
                                <input className="team-input" type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" />
                            </div>

                            <div className="team-row2">
                                <div className="team-field">
                                    <label>Phone</label>
                                    <input className="team-input" value={form.phone} onChange={set('phone')} placeholder="Phone number" />
                                </div>
                                <div className="team-field">
                                    <label>Role *</label>
                                    <CustomSelect
                                        value={form.role}
                                        onChange={val => setForm(prev => ({ ...prev, role: val }))}
                                        options={ROLES}
                                    />
                                </div>
                            </div>

                            <div className="team-divider" />

                            <div className="team-row2">
                                <div className="team-field">
                                    <label>{editing ? 'New Password (leave blank to keep)' : 'Password *'}</label>
                                    <input className="team-input" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" />
                                </div>
                                <div className="team-field">
                                    <label>Confirm Password</label>
                                    <input className="team-input" type="password" value={form.confirm_password} onChange={set('confirm_password')} placeholder="••••••••" />
                                </div>
                            </div>
                        </div>

                        <div className="team-modal-footer">
                            <button className="team-btn-cancel" onClick={() => setModalOpen(false)}>Cancel</button>
                            <button className="team-btn-save" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Member'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
