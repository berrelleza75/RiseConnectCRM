import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import CustomSelect from '../../components/CustomSelect/CustomSelect';
import { getContacts, createContact, updateContact, deleteContact } from '../../services/contactsService';
import { createLead } from '../../services/leadsService';
import './Contacts.css';

const OPT_SOURCE = [
    { value: 'manual',    label: 'Manual' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'facebook',  label: 'Facebook' },
    { value: 'tiktok',    label: 'TikTok' },
    { value: 'whatsapp',  label: 'WhatsApp' },
    { value: 'referral',  label: 'Referral' },
    { value: 'website',   label: 'Website' },
    { value: 'other',     label: 'Other' },
];

const OPT_STATUS = [
    { value: 'new',       label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'archived',  label: 'Archived' },
];

function Contacts() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [openMenuId, setOpenMenuId] = useState(null);
    const [contactToDelete, setContactToDelete] = useState(null);
    const [contactToConvert, setContactToConvert] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [editingContactId, setEditingContactId] = useState(null);
    const menuRef = useRef(null);

    const emptyForm = {
        first_name: '',
        last_name: '',
        email: '',
        cell_phone: '',
        source: 'manual',
        source_username: '',
        status: 'new'
    };

    const [formData, setFormData] = useState(emptyForm);

    const token = localStorage.getItem('token');
    const payload = token ? JSON.parse(atob(token.split('.')[1])) : {};
    const currentUserId = payload.id;
    const currentOfficeId = payload.office_id;

    const loadContacts = async () => {
        try {
            setLoading(true);
            const data = await getContacts();
            setContacts(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadContacts();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpenMenuId(null);
            }
        };
        if (openMenuId !== null) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openMenuId]);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openNewContactModal = () => {
        setEditingContactId(null);
        setFormData(emptyForm);
        setShowModal(true);
    };

    const openEditContactModal = (contact) => {
        setEditingContactId(contact.id);
        setFormData({
            first_name: contact.first_name || '',
            last_name: contact.last_name || '',
            email: contact.email || '',
            cell_phone: contact.cell_phone || '',
            source: contact.source || 'manual',
            source_username: contact.source_username || '',
            status: contact.status || 'new'
        });
        setShowModal(true);
    };

    const closeContactModal = () => {
        setShowModal(false);
        setEditingContactId(null);
        setFormData(emptyForm);
    };

    const handleSubmitContact = async (e) => {
        e.preventDefault();
        try {
            if (editingContactId) {
                await updateContact(editingContactId, {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                    cell_phone: formData.cell_phone,
                    source: formData.source,
                    source_username: formData.source_username,
                    status: formData.status,
                    assigned_to: null
                });
            } else {
                await createContact({
                    ...formData,
                    office_id: currentOfficeId,
                    created_by: currentUserId
                });
            }
            closeContactModal();
            loadContacts();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleConfirmDelete = async () => {
        if (!contactToDelete) return;
        try {
            await deleteContact(contactToDelete.id);
            setContactToDelete(null);
            loadContacts();
        } catch (err) {
            setError(err.message);
            setContactToDelete(null);
        }
    };

    const handleConfirmConvert = async () => {
        if (!contactToConvert) return;
        try {
            await createLead({
                contact_id: contactToConvert.id,
                office_id: currentOfficeId,
                assigned_to: null
            });
            const fullName = `${contactToConvert.first_name} ${contactToConvert.last_name}`;
            setContactToConvert(null);
            setSuccessMessage(`Lead created successfully for ${fullName}. You can find it in the Leads section.`);
        } catch (err) {
            setError(err.message);
            setContactToConvert(null);
        }
    };

    const handleMenuAction = (action, contact) => {
        setOpenMenuId(null);
        if (action === 'delete') {
            setContactToDelete(contact);
        } else if (action === 'edit') {
            openEditContactModal(contact);
        } else if (action === 'convert') {
            setContactToConvert(contact);
        }
    };

    const filteredContacts = contacts.filter(c => {
        const matchesFilter = activeFilter === 'all' || c.source === activeFilter;
        const query = searchQuery.toLowerCase();
        const matchesSearch = query === '' ||
            c.first_name.toLowerCase().includes(query) ||
            c.last_name.toLowerCase().includes(query) ||
            (c.email && c.email.toLowerCase().includes(query)) ||
            (c.cell_phone && c.cell_phone.includes(query));
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="page-wrapper">
            <Sidebar active="Contacts" />
            <div className="page-main">
                <Topbar />

                <div className="page-content">
                    <div className="page-header">
                        <div className="page-header-left">
                            <h1 className="page-title">Contacts</h1>
                            <span className="page-subtitle">{contacts.length} total</span>
                        </div>
                        <div className="page-header-right">
                            <div className="ct-search">
                                <svg className="ct-search-icon" width="14" height="14" viewBox="0 0 20 20" fill="#9a8f80">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search contacts..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button className="btn-primary" onClick={openNewContactModal}>
                                + New Contact
                            </button>
                        </div>
                    </div>

                    <div className="ct-filters">
                        <button className={`ct-filter ${activeFilter === 'all' ? 'on' : ''}`} onClick={() => setActiveFilter('all')}>All</button>
                        <button className={`ct-filter ${activeFilter === 'instagram' ? 'on' : ''}`} onClick={() => setActiveFilter('instagram')}>Instagram</button>
                        <button className={`ct-filter ${activeFilter === 'facebook' ? 'on' : ''}`} onClick={() => setActiveFilter('facebook')}>Facebook</button>
                        <button className={`ct-filter ${activeFilter === 'tiktok' ? 'on' : ''}`} onClick={() => setActiveFilter('tiktok')}>TikTok</button>
                        <button className={`ct-filter ${activeFilter === 'manual' ? 'on' : ''}`} onClick={() => setActiveFilter('manual')}>Manual</button>
                        <button className={`ct-filter ${activeFilter === 'other' ? 'on' : ''}`} onClick={() => setActiveFilter('other')}>Other</button>
                    </div>

                    <div className="ct-panel">
                        {loading && (
                            <div className="ct-state ct-state-loading">
                                <div className="ct-spinner"></div>
                                <span>Searching contacts...</span>
                            </div>
                        )}

                        {!loading && error && (
                            <div className="ct-state ct-state-error">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                    <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    <circle cx="12" cy="16" r="1" fill="currentColor"/>
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        {!loading && !error && filteredContacts.length === 0 && (
                            <div className="ct-empty">
                                <div className="ct-empty-icon">
                                    <svg width="48" height="48" viewBox="0 0 20 20" fill="#d4c7b3">
                                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                    </svg>
                                </div>
                                <div className="ct-empty-title">
                                    {searchQuery ? 'No contacts match your search' : 'No contacts yet'}
                                </div>
                                <div className="ct-empty-sub">
                                    {searchQuery ? 'Try a different search term' : 'Add your first contact to get started'}
                                </div>
                            </div>
                        )}

                        {!loading && !error && filteredContacts.length > 0 && (
                            <table className="ct-table">
                                <thead>
                                    <tr>
                                        <th>Contact</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Source</th>
                                        <th>Status</th>
                                        <th>Assigned To</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredContacts.map(contact => (
                                        <tr key={contact.id}>
                                            <td>
                                                <div className="ct-row">
                                                    <div className="ct-av">
                                                        {contact.first_name[0]}{contact.last_name[0]}
                                                    </div>
                                                    <div className="ct-name">
                                                        {contact.first_name} {contact.last_name}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{contact.email || '-'}</td>
                                            <td>{contact.cell_phone || '-'}</td>
                                            <td><span className={`ct-badge ct-src-${contact.source}`}>{contact.source}</span></td>
                                            <td><span className={`ct-badge ct-st-${contact.status}`}>{contact.status}</span></td>
                                            <td>
                                                {contact.assigned_first_name
                                                    ? `${contact.assigned_first_name} ${contact.assigned_last_name}`
                                                    : <span className="ct-muted">Unassigned</span>}
                                            </td>
                                            <td className="ct-actions-cell">
                                                <div className="ct-menu-wrapper" ref={openMenuId === contact.id ? menuRef : null}>
                                                    <button
                                                        className="ct-menu-btn"
                                                        onClick={() => setOpenMenuId(openMenuId === contact.id ? null : contact.id)}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                        </svg>
                                                    </button>
                                                    {openMenuId === contact.id && (
                                                        <div className="ct-menu">
                                                            <button
                                                                className="ct-menu-item"
                                                                onClick={() => handleMenuAction('convert', contact)}
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                                                </svg>
                                                                Convert to Lead
                                                            </button>
                                                            <button
                                                                className="ct-menu-item"
                                                                onClick={() => handleMenuAction('edit', contact)}
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"/>
                                                                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"/>
                                                                </svg>
                                                                Edit
                                                            </button>
                                                            <button
                                                                className="ct-menu-item"
                                                                onClick={() => handleMenuAction('archive', contact)}
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"/>
                                                                    <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd"/>
                                                                </svg>
                                                                Archive
                                                            </button>
                                                            <div className="ct-menu-divider"></div>
                                                            <button
                                                                className="ct-menu-item ct-menu-item-danger"
                                                                onClick={() => handleMenuAction('delete', contact)}
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                                                                </svg>
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="ct-modal-overlay" onClick={closeContactModal}>
                    <div className="ct-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ct-modal-head">
                            <h2>{editingContactId ? 'Edit Contact' : 'New Contact'}</h2>
                            <button className="ct-modal-close" onClick={closeContactModal}>×</button>
                        </div>

                        <form onSubmit={handleSubmitContact} className="ct-form">
                            <div className="ct-form-row">
                                <div className="ct-field">
                                    <label>First Name *</label>
                                    <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} required />
                                </div>
                                <div className="ct-field">
                                    <label>Last Name *</label>
                                    <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} required />
                                </div>
                            </div>

                            <div className="ct-field">
                                <label>Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                            </div>

                            <div className="ct-field">
                                <label>Cell Phone</label>
                                <input type="tel" name="cell_phone" value={formData.cell_phone} onChange={handleInputChange} />
                            </div>

                            <div className="ct-form-row">
                                <div className="ct-field">
                                    <label>Source</label>
                                    <CustomSelect name="source" value={formData.source} onChange={handleInputChange} options={OPT_SOURCE} />
                                </div>
                                <div className="ct-field">
                                    <label>Source Username</label>
                                    <input type="text" name="source_username" value={formData.source_username} onChange={handleInputChange} placeholder="@username" />
                                </div>
                            </div>

                            {editingContactId && (
                                <div className="ct-field">
                                    <label>Status</label>
                                    <CustomSelect name="status" value={formData.status} onChange={handleInputChange} options={OPT_STATUS} />
                                </div>
                            )}

                            <div className="ct-modal-actions">
                                <button type="button" className="btn-secondary" onClick={closeContactModal}>Cancel</button>
                                <button type="submit" className="btn-primary">
                                    {editingContactId ? 'Save Changes' : 'Create Contact'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {contactToDelete && (
                <div className="ct-modal-overlay" onClick={() => setContactToDelete(null)}>
                    <div className="ct-confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ct-confirm-icon ct-confirm-icon-danger">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                <line x1="12" y1="8" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                <circle cx="12" cy="16.5" r="1" fill="currentColor"/>
                            </svg>
                        </div>
                        <h2 className="ct-confirm-title">Delete contact</h2>
                        <p className="ct-confirm-text">
                            Are you sure you want to delete <strong>{contactToDelete.first_name} {contactToDelete.last_name}</strong>? This action cannot be undone.
                        </p>
                        <div className="ct-confirm-actions">
                            <button className="btn-secondary" onClick={() => setContactToDelete(null)}>
                                Cancel
                            </button>
                            <button className="ct-confirm-delete-btn" onClick={handleConfirmDelete}>
                                Delete contact
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {contactToConvert && (
                <div className="ct-modal-overlay" onClick={() => setContactToConvert(null)}>
                    <div className="ct-confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ct-confirm-icon ct-confirm-icon-accent">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                            </svg>
                        </div>
                        <h2 className="ct-confirm-title">Convert to Lead</h2>
                        <p className="ct-confirm-text">
                            Are you sure you want to convert <strong>{contactToConvert.first_name} {contactToConvert.last_name}</strong> to a Lead? You can complete the lead details later from the Leads section.
                        </p>
                        <div className="ct-confirm-actions">
                            <button className="btn-secondary" onClick={() => setContactToConvert(null)}>
                                Cancel
                            </button>
                            <button className="ct-confirm-convert-btn" onClick={handleConfirmConvert}>
                                Yes, convert to Lead
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {successMessage && (
                <div className="ct-toast">
                    <div className="ct-toast-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </div>
                    <div className="ct-toast-text">{successMessage}</div>
                    <button className="ct-toast-close" onClick={() => setSuccessMessage(null)}>×</button>
                </div>
            )}
        </div>
    );
}

export default Contacts;