import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import Dialer from '../../components/Dialer/Dialer';
import { getContacts } from '../../services/contactsService';
import { getLeadsByContact, updateLead } from '../../services/leadsService';
import { getContactMessages, sendSms, sendEmail, getMessageStats, markAsRead } from '../../services/messagesService';
import './Messages.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const LEAD_STATUSES     = ['new', 'working', 'qualified', 'converted', 'lost'];
const LOAN_STATUSES     = ['new', 'in_progress', 'submitted', 'approved', 'closed', 'denied', 'withdrawn'];
const LOAN_PURPOSES     = ['purchase', 'refinance', 'cash_out'];
const LOAN_TYPES        = ['conventional', 'fha', 'va', 'usda', 'jumbo', 'other'];
const PROPERTY_TYPES    = ['single_family', 'condo', 'townhouse', 'multi_family', 'manufactured', 'other'];
const OCCUPANCY_TYPES   = ['primary', 'secondary', 'investment'];
const BUYING_STAGES     = ['just_researching', 'researching', 'offer_submitted', 'offer_accepted', 'working_with_agent'];
const AMORT_TYPES       = ['fixed', 'arm'];

function initials(first, last) {
    return `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase();
}
function formatPhone(p) {
    if (!p) return '';
    const digits = p.replace(/\D/g, '');
    if (digits.length === 10) return `+52${digits}`;
    if (p.startsWith('+')) return p;
    return `+${digits}`;
}
function formatAmt(v) {
    if (!v) return '—';
    return `$${Number(v).toLocaleString()}`;
}
function timeLabel(ts) {
    if (!ts) return '';
    let d;
    if (ts instanceof Date) {
        d = ts;
    } else {
        // Normalize to ISO UTC so JS parses correctly regardless of mysql2 format
        const s = String(ts).trim().replace(' ', 'T');
        d = new Date(s.includes('Z') || s.includes('+') ? s : s + 'Z');
    }
    if (isNaN(d)) return '';
    const diff = Date.now() - d;
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// ── Small form primitives ────────────────────────────────
function Field({ label, children }) {
    return (
        <div className="mdf-field">
            <label className="mdf-label">{label}</label>
            {children}
        </div>
    );
}
function FInput({ value, onChange, type = 'text', placeholder = '' }) {
    return (
        <input
            className="mdf-input"
            type={type}
            value={value ?? ''}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
        />
    );
}
function FSelect({ value, onChange, options }) {
    return (
        <select className="mdf-select" value={value ?? ''} onChange={e => onChange(e.target.value)}>
            <option value="">— select —</option>
            {options.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
        </select>
    );
}
function FSection({ title }) {
    return <div className="mdf-section-title">{title}</div>;
}

// ── Lead inline form ─────────────────────────────────────
function LeadForm({ lead, onSave, saving }) {
    const [form, setForm] = useState({ ...lead });
    const set = (key) => (val) => setForm(prev => ({ ...prev, [key]: val }));

    return (
        <div className="mdf-form">
            <FSection title="Status & Intent" />
            <div className="mdf-row2">
                <Field label="Status">
                    <FSelect value={form.status} onChange={set('status')} options={LEAD_STATUSES} />
                </Field>
                <Field label="Loan Purpose">
                    <FSelect value={form.loan_purpose} onChange={set('loan_purpose')} options={LOAN_PURPOSES} />
                </Field>
            </div>

            <FSection title="Property" />
            <div className="mdf-row2">
                <Field label="Purchase Price">
                    <FInput type="number" value={form.purchase_price} onChange={set('purchase_price')} placeholder="0" />
                </Field>
                <Field label="Property Type">
                    <FSelect value={form.property_type} onChange={set('property_type')} options={PROPERTY_TYPES} />
                </Field>
            </div>
            <div className="mdf-row2">
                <Field label="Occupancy">
                    <FSelect value={form.property_occupancy} onChange={set('property_occupancy')} options={OCCUPANCY_TYPES} />
                </Field>
                <Field label="Buying Stage">
                    <FSelect value={form.buying_stage} onChange={set('buying_stage')} options={BUYING_STAGES} />
                </Field>
            </div>

            <FSection title="Borrower" />
            <div className="mdf-row2">
                <Field label="Credit Score Range">
                    <FInput value={form.credit_score_range} onChange={set('credit_score_range')} placeholder="e.g. 700-719" />
                </Field>
                <Field label="Desired Payment">
                    <FInput type="number" value={form.desired_monthly_payment} onChange={set('desired_monthly_payment')} placeholder="0" />
                </Field>
            </div>
            <div className="mdf-row2">
                <Field label="Gross Annual Income">
                    <FInput type="number" value={form.gross_annual_income} onChange={set('gross_annual_income')} placeholder="0" />
                </Field>
                <Field label="Employment Type">
                    <FInput value={form.employment_type} onChange={set('employment_type')} placeholder="W-2, Self-employed..." />
                </Field>
            </div>
            <div className="mdf-checks">
                <label className="mdf-check">
                    <input type="checkbox" checked={!!form.first_time_home_buyer} onChange={e => set('first_time_home_buyer')(e.target.checked)} />
                    First-time home buyer
                </label>
                <label className="mdf-check">
                    <input type="checkbox" checked={!!form.has_real_estate_agent} onChange={e => set('has_real_estate_agent')(e.target.checked)} />
                    Has real estate agent
                </label>
            </div>

            <FSection title="Lead Origin" />
            <div className="mdf-row2">
                <Field label="Lead Source">
                    <FInput value={form.lead_source} onChange={set('lead_source')} />
                </Field>
                <Field label="Lead Provided By">
                    <FInput value={form.lead_provided_by} onChange={set('lead_provided_by')} />
                </Field>
            </div>

            <button className="mdf-save-btn" onClick={() => onSave(form)} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
    );
}

// ── Loan inline form ─────────────────────────────────────
function LoanForm({ loan, onSave, saving }) {
    const [form, setForm] = useState({ ...loan });
    const set = (key) => (val) => setForm(prev => ({ ...prev, [key]: val }));

    return (
        <div className="mdf-form">
            <FSection title="Status & Type" />
            <div className="mdf-row2">
                <Field label="Status">
                    <FSelect value={form.status} onChange={set('status')} options={LOAN_STATUSES} />
                </Field>
                <Field label="Loan Purpose">
                    <FSelect value={form.loan_purpose} onChange={set('loan_purpose')} options={LOAN_PURPOSES} />
                </Field>
            </div>
            <div className="mdf-row2">
                <Field label="Loan Type">
                    <FSelect value={form.loan_type} onChange={set('loan_type')} options={LOAN_TYPES} />
                </Field>
                <Field label="Base Loan Amount">
                    <FInput type="number" value={form.base_loan_amount} onChange={set('base_loan_amount')} placeholder="0" />
                </Field>
            </div>

            <FSection title="Property" />
            <div className="mdf-row2">
                <Field label="Purchase Price">
                    <FInput type="number" value={form.purchase_price} onChange={set('purchase_price')} placeholder="0" />
                </Field>
                <Field label="Appraised Value">
                    <FInput type="number" value={form.appraised_value} onChange={set('appraised_value')} placeholder="0" />
                </Field>
            </div>
            <div className="mdf-row2">
                <Field label="Property Type">
                    <FSelect value={form.property_type} onChange={set('property_type')} options={PROPERTY_TYPES} />
                </Field>
                <Field label="Occupancy">
                    <FSelect value={form.property_occupancy} onChange={set('property_occupancy')} options={OCCUPANCY_TYPES} />
                </Field>
            </div>

            <FSection title="Rates & Terms" />
            <div className="mdf-row2">
                <Field label="Note Rate (%)">
                    <FInput type="number" value={form.note_rate} onChange={set('note_rate')} placeholder="0.000" />
                </Field>
                <Field label="Qualifying Rate (%)">
                    <FInput type="number" value={form.qualifying_rate} onChange={set('qualifying_rate')} placeholder="0.000" />
                </Field>
            </div>
            <div className="mdf-row2">
                <Field label="Amort. Type">
                    <FSelect value={form.amortization_type} onChange={set('amortization_type')} options={AMORT_TYPES} />
                </Field>
                <Field label="Term (months)">
                    <FInput type="number" value={form.amortization_term_months} onChange={set('amortization_term_months')} placeholder="360" />
                </Field>
            </div>
            <div className="mdf-row2">
                <Field label="Loan FICO">
                    <FInput type="number" value={form.loan_fico} onChange={set('loan_fico')} placeholder="0" />
                </Field>
                <Field label="Lien Position">
                    <FInput value={form.lien_position} onChange={set('lien_position')} placeholder="1st, 2nd..." />
                </Field>
            </div>

            <FSection title="Monthly Costs" />
            <div className="mdf-row2">
                <Field label="HOI (est.)">
                    <FInput type="number" value={form.estimated_monthly_hoi} onChange={set('estimated_monthly_hoi')} placeholder="0" />
                </Field>
                <Field label="Property Taxes (est.)">
                    <FInput type="number" value={form.estimated_monthly_property_taxes} onChange={set('estimated_monthly_property_taxes')} placeholder="0" />
                </Field>
            </div>
            <div className="mdf-row2">
                <Field label="HOA (est.)">
                    <FInput type="number" value={form.estimated_monthly_hoa} onChange={set('estimated_monthly_hoa')} placeholder="0" />
                </Field>
                <Field label="Monthly Liability">
                    <FInput type="number" value={form.total_monthly_liability} onChange={set('total_monthly_liability')} placeholder="0" />
                </Field>
            </div>

            <FSection title="Income" />
            <div className="mdf-row2">
                <Field label="Gross Annual Income">
                    <FInput type="number" value={form.gross_annual_income} onChange={set('gross_annual_income')} placeholder="0" />
                </Field>
                <Field label="Employment Type">
                    <FInput value={form.employment_type} onChange={set('employment_type')} placeholder="W-2, Self-employed..." />
                </Field>
            </div>

            <button className="mdf-save-btn" onClick={() => onSave(form)} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════
export default function Messages() {
    const token    = localStorage.getItem('token');
    const payload  = token ? JSON.parse(atob(token.split('.')[1])) : {};
    const officeId = payload.office_id;
    const userId   = payload.id;

    const [twilioNumbers, setTwilioNumbers]   = useState([]);
    const [fromNumber,    setFromNumber]      = useState('');
    const [contacts, setContacts]             = useState([]);
    const [search, setSearch]                 = useState('');
    const [contactFilter, setContactFilter]   = useState('all');
    const [msgStats, setMsgStats]             = useState({});
    const [selected, setSelected]             = useState(null);
    const [dialerOpen, setDialerOpen]         = useState(false);

    const [channel, setChannel]               = useState('sms');
    const [messages, setMessages]             = useState([]);
    const [loadingMsgs, setLoadingMsgs]       = useState(false);
    const [composeBody, setComposeBody]       = useState('');
    const [composeSubject, setComposeSubject] = useState('');
    const [sending, setSending]               = useState(false);
    const [sendError, setSendError]           = useState('');
    const threadRef = useRef(null);

    const [detailTab, setDetailTab]   = useState('leads');
    const [leads, setLeads]           = useState([]);
    const [loans, setLoans]           = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [expandedType, setExpandedType] = useState(null);
    const [fullDetails, setFullDetails]   = useState({});
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [savingId, setSavingId]     = useState(null);

    const refreshStats = () => {
        getMessageStats()
            .then(rows => {
                const map = {};
                rows.forEach(r => { map[r.contact_id] = r; });
                setMsgStats(map);
            })
            .catch(() => {});
    };

    useEffect(() => {
        getContacts().then(setContacts).catch(() => {});
        fetch(`${API_URL}/offices/twilio/numbers`)
            .then(r => r.json())
            .then(data => {
                const nums = data.current || [];
                setTwilioNumbers(nums);
                // default to office saved number or first available
                fetch(`${API_URL}/offices/${officeId}`)
                    .then(r => r.json())
                    .then(office => setFromNumber(office.twilio_phone || nums[0]?.phoneNumber || ''))
                    .catch(() => { if (nums[0]) setFromNumber(nums[0].phoneNumber); });
            })
            .catch(() => {});
        refreshStats();
    }, []);

    useEffect(() => {
        if (!selected) { setMessages([]); return; }
        setLoadingMsgs(true);
        getContactMessages(selected.id, channel)
            .then(setMessages)
            .catch(() => setMessages([]))
            .finally(() => setLoadingMsgs(false));
    }, [selected, channel]);

    useEffect(() => {
        if (threadRef.current) {
            threadRef.current.scrollTop = threadRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (!selected) { setLeads([]); setLoans([]); setExpandedId(null); return; }
        getLeadsByContact(selected.id).then(setLeads).catch(() => setLeads([]));
        fetch(`${API_URL}/loans/contact/${selected.id}`)
            .then(r => r.json()).then(setLoans).catch(() => setLoans([]));
    }, [selected]);

    const handleSelectContact = (c) => {
        setSelected(c);
        setExpandedId(null);
        setExpandedType(null);
        setFullDetails({});
        setComposeBody('');
        setComposeSubject('');
        setSendError('');
        // mark inbound messages as read and update local stats
        markAsRead(c.id).then(() => {
            setMsgStats(prev => ({
                ...prev,
                [c.id]: { ...(prev[c.id] || {}), unread_count: 0 }
            }));
        }).catch(() => {});
    };

    const handleToggleExpand = async (type, item) => {
        if (expandedId === item.id) {
            setExpandedId(null);
            setExpandedType(null);
            return;
        }
        setExpandedId(item.id);
        setExpandedType(type);
        if (fullDetails[item.id]) return; // already cached
        setLoadingDetail(true);
        try {
            const url = type === 'lead'
                ? `${API_URL}/leads/${item.id}`
                : `${API_URL}/loans/${item.id}`;
            const res  = await fetch(url);
            const data = await res.json();
            setFullDetails(prev => ({ ...prev, [item.id]: data }));
        } catch (_) {}
        setLoadingDetail(false);
    };

    const handleSend = async () => {
        if (!composeBody.trim() || !selected) return;
        setSending(true);
        setSendError('');
        try {
            let msg;
            if (channel === 'sms') {
                const to = formatPhone(selected.cell_phone);
                if (!to) { setSendError('This contact has no phone number.'); setSending(false); return; }
                msg = await sendSms({ contact_id: selected.id, to, body: composeBody.trim(), office_id: officeId, created_by: userId, from: fromNumber });
            } else {
                if (!selected.email) { setSendError('This contact has no email address.'); setSending(false); return; }
                msg = await sendEmail({ contact_id: selected.id, to: selected.email, subject: composeSubject.trim() || '(no subject)', body: composeBody.trim(), office_id: officeId, created_by: userId });
            }
            setMessages(prev => [...prev, msg]);
            setComposeBody('');
            setComposeSubject('');
            refreshStats();
        } catch (err) {
            setSendError(err.message || 'Failed to send message.');
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSaveLead = async (form) => {
        setSavingId(form.id);
        try {
            await updateLead(form.id, form);
            setLeads(prev => prev.map(l => l.id === form.id ? { ...l, ...form } : l));
            setFullDetails(prev => ({ ...prev, [form.id]: { ...prev[form.id], ...form } }));
        } catch (_) {}
        setSavingId(null);
    };

    const handleSaveLoan = async (form) => {
        setSavingId(form.id);
        try {
            await fetch(`${API_URL}/loans/${form.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            setLoans(prev => prev.map(l => l.id === form.id ? { ...l, ...form } : l));
            setFullDetails(prev => ({ ...prev, [form.id]: { ...prev[form.id], ...form } }));
        } catch (_) {}
        setSavingId(null);
    };

    const filtered = contacts.filter(c => {
        const q = search.toLowerCase();
        const matchesSearch = !q
            || `${c.first_name} ${c.last_name}`.toLowerCase().includes(q)
            || (c.cell_phone || '').includes(q)
            || (c.email || '').toLowerCase().includes(q);
        if (!matchesSearch) return false;
        if (contactFilter === 'recents') return !!msgStats[c.id];
        if (contactFilter === 'new') return msgStats[c.id]?.unread_count > 0;
        return true;
    });

    // sort: unread first, then by last message date
    const sortedContacts = [...filtered].sort((a, b) => {
        const sa = msgStats[a.id], sb = msgStats[b.id];
        const ua = sa?.unread_count || 0, ub = sb?.unread_count || 0;
        if (ua !== ub) return ub - ua;
        const ta = sa?.last_message_at ? new Date(sa.last_message_at) : new Date(a.created_at);
        const tb = sb?.last_message_at ? new Date(sb.last_message_at) : new Date(b.created_at);
        return tb - ta;
    });

    return (
        <div className="page-wrapper">
            <Sidebar active="Messages" />
            <div className="page-main" style={{ overflow: 'hidden' }}>
                <Topbar />
                <div className="msg-root">

                    {/* ── Column 1: Contact list ── */}
                    <div className="msg-contacts">
                        <div className="msg-contacts-header">
                            <h2 className="msg-contacts-title">Messages</h2>
                            <div className="msg-search-wrap">
                                <svg className="msg-search-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                                </svg>
                                <input
                                    className="msg-search"
                                    placeholder="Search contacts..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="msg-filter-tabs">
                                {['all','recents','new'].map(f => (
                                    <button
                                        key={f}
                                        className={`msg-filter-tab ${contactFilter === f ? 'active' : ''}`}
                                        onClick={() => setContactFilter(f)}
                                    >
                                        {f.charAt(0).toUpperCase() + f.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="msg-contact-list">
                            {sortedContacts.length === 0 && (
                                <div className="msg-empty-contacts">No contacts found</div>
                            )}
                            {sortedContacts.map(c => {
                                const stats = msgStats[c.id];
                                const unread = stats?.unread_count || 0;
                                return (
                                    <div
                                        key={c.id}
                                        className={`msg-contact-item ${selected?.id === c.id ? 'selected' : ''}`}
                                        onClick={() => handleSelectContact(c)}
                                    >
                                        <div className="msg-contact-av">{initials(c.first_name, c.last_name)}</div>
                                        <div className="msg-contact-info">
                                            <div className="msg-contact-name-row">
                                                <span className="msg-contact-name">{c.first_name} {c.last_name}</span>
                                                {unread > 0 && <span className="msg-unread-badge">{unread}</span>}
                                            </div>
                                            <div className="msg-contact-sub">
                                                {stats?.last_message_at
                                                    ? timeLabel(stats.last_message_at)
                                                    : (c.cell_phone || c.email || '—')}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Column 2: Conversation ── */}
                    <div className="msg-conv">
                        {!selected ? (
                            <div className="msg-conv-empty">
                                <div className="msg-conv-empty-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                                    </svg>
                                </div>
                                <p>Select a contact to view their conversation</p>
                            </div>
                        ) : (
                            <>
                                <div className="msg-conv-header">
                                    <div className="msg-conv-av">{initials(selected.first_name, selected.last_name)}</div>
                                    <div>
                                        <div className="msg-conv-name">{selected.first_name} {selected.last_name}</div>
                                        <div className="msg-conv-meta">
                                            {selected.cell_phone && <span>{selected.cell_phone}</span>}
                                            {selected.cell_phone && selected.email && <span> · </span>}
                                            {selected.email && <span>{selected.email}</span>}
                                        </div>
                                    </div>
                                    <div className="msg-channel-tabs">
                                        <button className={`msg-channel-tab ${channel === 'sms' ? 'active' : ''}`} onClick={() => setChannel('sms')}>
                                            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                                                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                                                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
                                            </svg>
                                            SMS
                                        </button>
                                        <button className={`msg-channel-tab ${channel === 'email' ? 'active' : ''}`} onClick={() => setChannel('email')}>
                                            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                                            </svg>
                                            Email
                                        </button>
                                        <button
                                            className={`msg-call-btn ${dialerOpen ? 'active' : ''}`}
                                            onClick={() => setDialerOpen(d => !d)}
                                            title="Call contact"
                                        >
                                            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                                            </svg>
                                            Call
                                        </button>
                                    </div>
                                </div>

                                <div className="msg-thread" ref={threadRef}>
                                    {loadingMsgs && <div className="msg-thread-loading">Loading...</div>}
                                    {!loadingMsgs && messages.length === 0 && (
                                        <div className="msg-thread-empty">
                                            No {channel === 'sms' ? 'SMS' : 'email'} messages with this contact yet.
                                        </div>
                                    )}
                                    {messages.map(m => (
                                        <div key={m.id} className={`msg-bubble-wrap ${m.direction === 'outbound' ? 'out' : 'in'}`}>
                                            {channel === 'email' && m.subject && (
                                                <div className={`msg-email-subject ${m.direction === 'outbound' ? 'out' : 'in'}`}>{m.subject}</div>
                                            )}
                                            <div className={`msg-bubble ${m.direction === 'outbound' ? 'out' : 'in'}`}>{m.content}</div>
                                            <div className={`msg-bubble-time ${m.direction === 'outbound' ? 'out' : 'in'}`}>{timeLabel(m.created_at)}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="msg-compose">
                                    {sendError && <div className="msg-send-error">{sendError}</div>}
                                    {channel === 'sms' && twilioNumbers.length > 1 && (
                                        <div className="msg-from-row">
                                            <span className="msg-from-label">From:</span>
                                            <select className="msg-from-select" value={fromNumber} onChange={e => setFromNumber(e.target.value)}>
                                                {twilioNumbers.map(n => (
                                                    <option key={n.sid} value={n.phoneNumber}>{n.phoneNumber}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    {channel === 'email' && (
                                        <input className="msg-subject-input" placeholder="Subject..." value={composeSubject} onChange={e => setComposeSubject(e.target.value)} />
                                    )}
                                    <div className="msg-compose-row">
                                        <textarea
                                            className="msg-textarea"
                                            placeholder={channel === 'sms' ? 'Type an SMS...' : 'Type an email...'}
                                            value={composeBody}
                                            onChange={e => setComposeBody(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            rows={3}
                                        />
                                        <button className="msg-send-btn" onClick={handleSend} disabled={sending || !composeBody.trim()}>
                                            {sending ? (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" style={{ animation: 'spin 1s linear infinite' }}>
                                                    <path strokeLinecap="round" d="M4 12a8 8 0 018-8"/>
                                                </svg>
                                            ) : (
                                                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <div className="msg-compose-hint">
                                        {channel === 'sms'
                                            ? `Sending from ${process.env.REACT_APP_TWILIO_PHONE || '+14322551476'} · Enter to send · Shift+Enter for new line`
                                            : 'Enter to send · Shift+Enter for new line'}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* ── Column 3: Leads & Loans (full detail) ── */}
                    <div className="msg-detail">
                        {!selected ? (
                            <div className="msg-detail-empty">Select a contact to view their leads and loans</div>
                        ) : (
                            <>
                                <div className="msg-detail-header">
                                    <span>{selected.first_name} {selected.last_name}</span>
                                </div>

                                <div className="msg-detail-tabs">
                                    <button
                                        className={`msg-detail-tab ${detailTab === 'leads' ? 'active' : ''}`}
                                        onClick={() => { setDetailTab('leads'); setExpandedId(null); }}
                                    >
                                        Leads
                                        {leads.length > 0 && <span className="msg-badge">{leads.length}</span>}
                                    </button>
                                    <button
                                        className={`msg-detail-tab ${detailTab === 'loans' ? 'active' : ''}`}
                                        onClick={() => { setDetailTab('loans'); setExpandedId(null); }}
                                    >
                                        Loans
                                        {loans.length > 0 && <span className="msg-badge">{loans.length}</span>}
                                    </button>
                                </div>

                                <div className="msg-record-list">
                                    {detailTab === 'leads' && (
                                        <>
                                            {leads.length === 0 && <div className="msg-record-empty">No leads for this contact</div>}
                                            {leads.map(lead => (
                                                <div key={lead.id} className={`msg-record-card ${expandedId === lead.id ? 'expanded' : ''}`}>
                                                    <div
                                                        className="msg-record-card-head"
                                                        onClick={() => handleToggleExpand('lead', lead)}
                                                    >
                                                        <div>
                                                            <div className="msg-record-id">Lead #{lead.id}</div>
                                                            <div className="msg-record-purpose">{lead.loan_purpose || '—'}</div>
                                                        </div>
                                                        <div className="msg-record-right">
                                                            <span className={`msg-status-badge lead-${lead.status}`}>{lead.status}</span>
                                                            <svg className="msg-chevron" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                                                                <polyline points="2,3.5 5,6.5 8,3.5"/>
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    {expandedId === lead.id && (
                                                        loadingDetail
                                                            ? <div className="mdf-loading">Loading...</div>
                                                            : <LeadForm
                                                                key={lead.id}
                                                                lead={fullDetails[lead.id] || lead}
                                                                onSave={handleSaveLead}
                                                                saving={savingId === lead.id}
                                                            />
                                                    )}
                                                </div>
                                            ))}
                                        </>
                                    )}

                                    {detailTab === 'loans' && (
                                        <>
                                            {loans.length === 0 && <div className="msg-record-empty">No loans for this contact</div>}
                                            {loans.map(loan => (
                                                <div key={loan.id} className={`msg-record-card ${expandedId === loan.id ? 'expanded' : ''}`}>
                                                    <div
                                                        className="msg-record-card-head"
                                                        onClick={() => handleToggleExpand('loan', loan)}
                                                    >
                                                        <div>
                                                            <div className="msg-record-id">Loan #{loan.id}</div>
                                                            <div className="msg-record-purpose">{loan.loan_purpose || '—'}</div>
                                                        </div>
                                                        <div className="msg-record-right">
                                                            <span className={`msg-status-badge loan-${loan.status}`}>{loan.status}</span>
                                                            <svg className="msg-chevron" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                                                                <polyline points="2,3.5 5,6.5 8,3.5"/>
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    {expandedId === loan.id && (
                                                        loadingDetail
                                                            ? <div className="mdf-loading">Loading...</div>
                                                            : <LoanForm
                                                                key={loan.id}
                                                                loan={fullDetails[loan.id] || loan}
                                                                onSave={handleSaveLoan}
                                                                saving={savingId === loan.id}
                                                            />
                                                    )}
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                </div>
            </div>

            {dialerOpen && (
                <Dialer
                    initialNumber={selected?.cell_phone ? formatPhone(selected.cell_phone) : ''}
                    onClose={() => setDialerOpen(false)}
                />
            )}
        </div>
    );
}
