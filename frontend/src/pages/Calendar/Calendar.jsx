import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import { getAppointments, createAppointment, updateAppointment, deleteAppointment } from '../../services/appointmentsService';
import { getContacts } from '../../services/contactsService';
import './Calendar.css';

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const STATUS_COLORS = { scheduled: '#0c447c', completed: '#27500a', cancelled: '#bf360c', no_show: '#b8860b' };

const pad  = (n) => String(n).padStart(2, '0');
const toDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const today = toDateStr(new Date());

function fmt12(time) {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${m} ${ampm}`;
}

// ── Custom time picker ───────────────────────────────────
function TimePicker({ value, onChange, placeholder = 'Select time' }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    let selH = null, selM = null, selAp = 'AM';
    if (value) {
        const [hh, mm] = value.split(':').map(Number);
        selAp = hh >= 12 ? 'PM' : 'AM';
        selH  = hh % 12 || 12;
        selM  = mm;
    }

    const emit = (h, m, ap) => {
        const h24 = ap === 'PM' ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h);
        onChange(`${pad(h24)}:${pad(m)}`);
    };

    const hours = [12,1,2,3,4,5,6,7,8,9,10,11];
    const mins  = [0,5,10,15,20,25,30,35,40,45,50,55];
    const display = selH !== null ? `${selH}:${pad(selM)} ${selAp}` : placeholder;

    return (
        <div className="tpick" ref={ref}>
            <button type="button" className={`tpick-btn ${open ? 'open' : ''} ${value ? 'has-val' : ''}`}
                onClick={() => setOpen(o => !o)}>
                <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" style={{flexShrink:0,color:'var(--color-text-muted)'}}>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
                <span className={value ? 'tpick-val' : 'tpick-ph'}>{display}</span>
                <svg className={`tpick-arrow ${open ? 'up' : ''}`} viewBox="0 0 20 20" fill="currentColor" width="13" height="13" style={{flexShrink:0}}>
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
            </button>
            {open && (
                <div className="tpick-panel">
                    <div className="tpick-cols">
                        <div className="tpick-col">
                            <div className="tpick-col-lbl">Hour</div>
                            <div className="tpick-scroll">
                                {hours.map(h => (
                                    <div key={h} className={`tpick-item ${selH === h ? 'sel' : ''}`}
                                        onClick={() => emit(h, selM ?? 0, selAp)}>{h}</div>
                                ))}
                            </div>
                        </div>
                        <div className="tpick-sep">:</div>
                        <div className="tpick-col">
                            <div className="tpick-col-lbl">Min</div>
                            <div className="tpick-scroll">
                                {mins.map(m => (
                                    <div key={m} className={`tpick-item ${selM === m ? 'sel' : ''}`}
                                        onClick={() => emit(selH ?? 12, m, selAp)}>{pad(m)}</div>
                                ))}
                            </div>
                        </div>
                        <div className="tpick-col">
                            <div className="tpick-col-lbl">&nbsp;</div>
                            <div className="tpick-scroll">
                                {['AM','PM'].map(ap => (
                                    <div key={ap} className={`tpick-item tpick-ap ${selAp === ap ? 'sel' : ''}`}
                                        onClick={() => emit(selH ?? 12, selM ?? 0, ap)}>{ap}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Custom dropdown ──────────────────────────────────────
function CustomSelect({ value, onChange, options, placeholder = '— select —', searchable = false }) {
    const [open, setOpen]       = useState(false);
    const [query, setQuery]     = useState('');
    const ref                   = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = searchable
        ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
        : options;

    const selected = options.find(o => String(o.value) === String(value));

    return (
        <div className="csel" ref={ref}>
            <button
                type="button"
                className={`csel-trigger ${open ? 'open' : ''} ${selected ? 'has-value' : ''}`}
                onClick={() => { setOpen(o => !o); setQuery(''); }}
            >
                <span className={selected ? 'csel-value' : 'csel-placeholder'}>
                    {selected ? selected.label : placeholder}
                </span>
                <svg className={`csel-arrow ${open ? 'up' : ''}`} viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
            </button>
            {open && (
                <div className="csel-dropdown">
                    {searchable && (
                        <div className="csel-search-wrap">
                            <input
                                className="csel-search"
                                placeholder="Search..."
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                    )}
                    <div className="csel-list">
                        {filtered.length === 0 && <div className="csel-empty">No results</div>}
                        {filtered.map(o => (
                            <div
                                key={o.value}
                                className={`csel-option ${String(o.value) === String(value) ? 'selected' : ''}`}
                                onClick={() => { onChange(o.value); setOpen(false); setQuery(''); }}
                            >
                                {o.label}
                                {String(o.value) === String(value) && (
                                    <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                    </svg>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

const EMPTY_FORM = {
    title: '', date: '', time: '', end_time: '',
    location: '', description: '', contact_id: '', status: 'scheduled',
};

export default function Calendar() {
    const token   = localStorage.getItem('token');
    const payload = token ? JSON.parse(atob(token.split('.')[1])) : {};
    const officeId = payload.office_id;
    const userId   = payload.id;

    const now = new Date();
    const [viewYear,  setViewYear]  = useState(now.getFullYear());
    const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-based
    const [selectedDay, setSelectedDay] = useState(today);
    const [appointments, setAppointments] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);

    const [modalOpen, setModalOpen]   = useState(false);
    const [editing, setEditing]       = useState(null); // appointment being edited
    const [form, setForm]             = useState(EMPTY_FORM);
    const [saving, setSaving]         = useState(false);
    const [formError, setFormError]   = useState('');
    const [deleting, setDeleting]     = useState(null);

    const loadAppointments = useCallback(() => {
        setLoading(true);
        getAppointments(viewYear, viewMonth + 1)
            .then(setAppointments)
            .catch(() => setAppointments([]))
            .finally(() => setLoading(false));
    }, [viewYear, viewMonth]);

    useEffect(() => { loadAppointments(); }, [loadAppointments]);
    useEffect(() => { getContacts().then(setContacts).catch(() => {}); }, []);

    const prevMonth = () => {
        if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
        else setViewMonth(m => m + 1);
    };
    const goToday = () => {
        const n = new Date();
        setViewYear(n.getFullYear());
        setViewMonth(n.getMonth());
        setSelectedDay(today);
    };

    // Build calendar grid
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    // Map appointments by date string
    const apptByDay = {};
    appointments.forEach(a => {
        const key = a.date ? a.date.slice(0, 10) : null;
        if (!key) return;
        if (!apptByDay[key]) apptByDay[key] = [];
        apptByDay[key].push(a);
    });

    const dayAppts = apptByDay[selectedDay] || [];

    const openNew = () => {
        setEditing(null);
        setForm({ ...EMPTY_FORM, date: selectedDay });
        setFormError('');
        setModalOpen(true);
    };

    const openEdit = (appt) => {
        setEditing(appt);
        setForm({
            title: appt.title || '',
            date: appt.date ? appt.date.slice(0, 10) : '',
            time: appt.time || '',
            end_time: appt.end_time || '',
            location: appt.location || '',
            description: appt.description || '',
            contact_id: appt.contact_id || '',
            status: appt.status || 'scheduled',
        });
        setFormError('');
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!form.title.trim()) { setFormError('Title is required.'); return; }
        if (!form.date)         { setFormError('Date is required.'); return; }
        setSaving(true);
        setFormError('');
        try {
            const data = { ...form, office_id: officeId, assigned_to: userId,
                contact_id: form.contact_id || null };
            if (editing) {
                await updateAppointment(editing.id, data);
            } else {
                await createAppointment(data);
            }
            setModalOpen(false);
            loadAppointments();
        } catch (err) {
            setFormError(err.message || 'Failed to save.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        setDeleting(id);
        try {
            await deleteAppointment(id);
            loadAppointments();
        } catch (_) {}
        setDeleting(null);
    };

    const set = (key) => (val) => setForm(prev => ({ ...prev, [key]: val }));

    return (
        <div className="page-wrapper">
            <Sidebar active="Calendar" />
            <div className="page-main">
                <Topbar />
                <div className="page-content">

                    <div className="cal-root">

                        {/* ── Left: Month grid ── */}
                        <div className="cal-left">
                            <div className="cal-nav">
                                <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
                                <div className="cal-nav-center">
                                    <span className="cal-month-label">{MONTHS[viewMonth]} {viewYear}</span>
                                    <button className="cal-today-btn" onClick={goToday}>Today</button>
                                </div>
                                <button className="cal-nav-btn" onClick={nextMonth}>›</button>
                            </div>

                            <div className="cal-grid">
                                {DAYS.map(d => (
                                    <div key={d} className="cal-day-name">{d}</div>
                                ))}
                                {cells.map((day, i) => {
                                    if (!day) return <div key={`e-${i}`} className="cal-cell cal-cell-empty" />;
                                    const dateStr = `${viewYear}-${pad(viewMonth+1)}-${pad(day)}`;
                                    const isToday    = dateStr === today;
                                    const isSelected = dateStr === selectedDay;
                                    const dayApts = apptByDay[dateStr] || [];
                                    return (
                                        <div
                                            key={dateStr}
                                            className={`cal-cell ${isToday ? 'cal-cell-today' : ''} ${isSelected ? 'cal-cell-selected' : ''}`}
                                            onClick={() => setSelectedDay(dateStr)}
                                        >
                                            <span className="cal-cell-num">{day}</span>
                                            <div className="cal-cell-dots">
                                                {dayApts.slice(0, 3).map(a => (
                                                    <span key={a.id} className="cal-dot" style={{ background: STATUS_COLORS[a.status] || '#0c447c' }} />
                                                ))}
                                                {dayApts.length > 3 && <span className="cal-dot-more">+{dayApts.length - 3}</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Status legend */}
                            <div className="cal-legend">
                                {Object.entries(STATUS_COLORS).map(([s, c]) => (
                                    <div key={s} className="cal-legend-item">
                                        <span className="cal-legend-dot" style={{ background: c }} />
                                        <span>{s.replace('_', ' ')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Right: Day appointments ── */}
                        <div className="cal-right">
                            <div className="cal-day-header">
                                <div>
                                    <div className="cal-day-title">
                                        {new Date(selectedDay + 'T12:00:00').toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                    </div>
                                    <div className="cal-day-sub">
                                        {loading ? 'Loading...' : `${dayAppts.length} appointment${dayAppts.length !== 1 ? 's' : ''}`}
                                    </div>
                                </div>
                                <button className="cal-add-btn" onClick={openNew}>+ New Appointment</button>
                            </div>

                            <div className="cal-appt-list">
                                {dayAppts.length === 0 && !loading && (
                                    <div className="cal-appt-empty">
                                        No appointments for this day.
                                        <br />
                                        <button className="cal-appt-empty-btn" onClick={openNew}>Add one</button>
                                    </div>
                                )}
                                {dayAppts.map(appt => (
                                    <div key={appt.id} className="cal-appt-card" style={{ borderLeftColor: STATUS_COLORS[appt.status] || '#0c447c' }}>
                                        <div className="cal-appt-top">
                                            <div>
                                                <div className="cal-appt-title">{appt.title}</div>
                                                {appt.time && (
                                                    <div className="cal-appt-time">
                                                        {fmt12(appt.time)}{appt.end_time ? ` – ${fmt12(appt.end_time)}` : ''}
                                                    </div>
                                                )}
                                            </div>
                                            <span className={`cal-appt-badge cal-badge-${appt.status}`}>{appt.status?.replace('_',' ')}</span>
                                        </div>
                                        {appt.location && <div className="cal-appt-location">📍 {appt.location}</div>}
                                        {(appt.contact_first_name) && (
                                            <div className="cal-appt-contact">👤 {appt.contact_first_name} {appt.contact_last_name}</div>
                                        )}
                                        {appt.description && <div className="cal-appt-desc">{appt.description}</div>}
                                        <div className="cal-appt-actions">
                                            <button className="cal-appt-edit" onClick={() => openEdit(appt)}>Edit</button>
                                            <button
                                                className="cal-appt-del"
                                                onClick={() => handleDelete(appt.id)}
                                                disabled={deleting === appt.id}
                                            >
                                                {deleting === appt.id ? '...' : 'Delete'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* ── Appointment Modal ── */}
            {modalOpen && (
                <div className="cal-modal-backdrop" onClick={() => setModalOpen(false)}>
                    <div className="cal-modal" onClick={e => e.stopPropagation()}>
                        <div className="cal-modal-header">
                            <span>{editing ? 'Edit Appointment' : 'New Appointment'}</span>
                            <button className="cal-modal-close" onClick={() => setModalOpen(false)}>×</button>
                        </div>

                        <div className="cal-modal-body">
                            {formError && <div className="cal-form-error">{formError}</div>}

                            <div className="cal-field">
                                <label>Title *</label>
                                <input className="cal-input" value={form.title} onChange={e => set('title')(e.target.value)} placeholder="Appointment title" autoFocus />
                            </div>

                            <div className="cal-row2">
                                <div className="cal-field">
                                    <label>Date *</label>
                                    <input className="cal-input" type="date" value={form.date} onChange={e => set('date')(e.target.value)} />
                                </div>
                                <div className="cal-field">
                                    <label>Status</label>
                                    <CustomSelect
                                        value={form.status}
                                        onChange={set('status')}
                                        options={[
                                            { value: 'scheduled', label: 'Scheduled' },
                                            { value: 'completed', label: 'Completed' },
                                            { value: 'cancelled', label: 'Cancelled' },
                                            { value: 'no_show',   label: 'No Show' },
                                        ]}
                                    />
                                </div>
                            </div>

                            <div className="cal-row2">
                                <div className="cal-field">
                                    <label>Start Time</label>
                                    <TimePicker value={form.time} onChange={set('time')} placeholder="Start time" />
                                </div>
                                <div className="cal-field">
                                    <label>End Time</label>
                                    <TimePicker value={form.end_time} onChange={set('end_time')} placeholder="End time" />
                                </div>
                            </div>

                            <div className="cal-field">
                                <label>Location</label>
                                <input className="cal-input" value={form.location} onChange={e => set('location')(e.target.value)} placeholder="Office, Zoom, address..." />
                            </div>

                            <div className="cal-field">
                                <label>Contact (optional)</label>
                                <CustomSelect
                                    value={form.contact_id}
                                    onChange={set('contact_id')}
                                    placeholder="— No contact —"
                                    searchable={true}
                                    options={[
                                        { value: '', label: '— No contact —' },
                                        ...contacts.map(c => ({ value: c.id, label: `${c.first_name} ${c.last_name}` }))
                                    ]}
                                />
                            </div>

                            <div className="cal-field">
                                <label>Notes</label>
                                <textarea className="cal-textarea" value={form.description} onChange={e => set('description')(e.target.value)} rows={3} placeholder="Additional notes..." />
                            </div>
                        </div>

                        <div className="cal-modal-footer">
                            <button className="cal-btn-cancel" onClick={() => setModalOpen(false)}>Cancel</button>
                            <button className="cal-btn-save" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Appointment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
