import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import CustomSelect from '../../components/CustomSelect/CustomSelect';
import { getLeads, createLead, updateLead, deleteLead } from '../../services/leadsService';
import { getContacts } from '../../services/contactsService';
import { createLoan } from '../../services/loansService';
import './Leads.css';

function Leads() {
    const [leads, setLeads] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [openMenuId, setOpenMenuId] = useState(null);
    const [showNewModal, setShowNewModal] = useState(false);
    const [selectedContactId, setSelectedContactId] = useState('');
    const [leadToDelete, setLeadToDelete] = useState(null);
    const [leadToConvert, setLeadToConvert] = useState(null);
    const [converting, setConverting] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const menuRef = useRef(null);

    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const payload = token ? JSON.parse(atob(token.split('.')[1])) : {};
    const currentOfficeId = payload.office_id;

    const loadLeads = async () => {
        try {
            setLoading(true);
            const data = await getLeads();
            setLeads(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadContacts = async () => {
        try {
            const data = await getContacts();
            setContacts(data);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        loadLeads();
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

    const handleCreateLead = async (e) => {
        e.preventDefault();
        if (!selectedContactId) return;
        try {
            await createLead({
                contact_id: parseInt(selectedContactId),
                office_id: currentOfficeId,
                assigned_to: null
            });
            const contact = contacts.find(c => c.id === parseInt(selectedContactId));
            const fullName = contact ? `${contact.first_name} ${contact.last_name}` : '';
            setShowNewModal(false);
            setSelectedContactId('');
            setSuccessMessage(`Lead created successfully for ${fullName}.`);
            loadLeads();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleStatusChange = async (lead, newStatus) => {
        setOpenMenuId(null);
        try {
            await updateLead(lead.id, { status: newStatus });
            setSuccessMessage(`Lead marked as ${newStatus}.`);
            loadLeads();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleConfirmDelete = async () => {
        if (!leadToDelete) return;
        try {
            await deleteLead(leadToDelete.id);
            setLeadToDelete(null);
            setSuccessMessage('Lead deleted successfully.');
            loadLeads();
        } catch (err) {
            setError(err.message);
            setLeadToDelete(null);
        }
    };

    const handleConvertToLoan = async () => {
        if (!leadToConvert || converting) return;
        setConverting(true);
        try {
            await createLoan({
                contact_id: leadToConvert.contact_id,
                lead_id: leadToConvert.id,
                office_id: currentOfficeId,
                assigned_to: leadToConvert.assigned_to || null,
                loan_purpose: leadToConvert.loan_purpose || null,
                subject_property_tbd: leadToConvert.subject_property_tbd,
                property_street: leadToConvert.street_address || null,
                property_unit: leadToConvert.unit_apt || null,
                property_city: leadToConvert.city || null,
                property_state: leadToConvert.state || null,
                property_postal: leadToConvert.postal_code || null,
                property_county: leadToConvert.county || null,
                property_type: leadToConvert.property_type || null,
                property_occupancy: leadToConvert.property_occupancy || null,
                purchase_price: leadToConvert.purchase_price || null,
                buying_stage: leadToConvert.buying_stage || null,
                first_time_home_buyer: leadToConvert.first_time_home_buyer,
                has_real_estate_agent: leadToConvert.has_real_estate_agent,
                desired_monthly_payment: leadToConvert.desired_monthly_payment || null,
                current_interest_rate: leadToConvert.current_interest_rate || null,
                currently_owning_home: leadToConvert.currently_owning_home,
                planning_to_sell: leadToConvert.planning_to_sell,
                gross_annual_income: leadToConvert.gross_annual_income || null,
                employment_type: leadToConvert.employment_type || null,
                military_service: leadToConvert.military_service,
                current_occupancy: leadToConvert.current_occupancy || null,
                monthly_rent_amount: leadToConvert.monthly_rent_amount || null,
                lead_provided_by: leadToConvert.lead_provided_by || null,
                lead_source: leadToConvert.lead_source || null,
                other_lead_source_description: leadToConvert.other_lead_source_description || null,
                dnc_request: leadToConvert.dnc_request ?? false,
                email_opt_out: leadToConvert.email_opt_out ?? false,
                sms_opt_out: leadToConvert.sms_opt_out ?? false,
            });
            await updateLead(leadToConvert.id, { status: 'converted' });
            setLeadToConvert(null);
            setSuccessMessage(`Loan created for ${leadToConvert.contact_first_name} ${leadToConvert.contact_last_name}.`);
            loadLeads();
        } catch (err) {
            setError(err.message);
            setLeadToConvert(null);
        } finally {
            setConverting(false);
        }
    };

    const handleMenuAction = (action, lead) => {
        setOpenMenuId(null);
        if (action === 'delete') {
            setLeadToDelete(lead);
        } else if (action === 'convert') {
            setLeadToConvert(lead);
        } else if (action === 'qualified') {
            handleStatusChange(lead, 'qualified');
        } else if (action === 'lost') {
            handleStatusChange(lead, 'lost');
        }
    };

    const filteredLeads = leads.filter(l => {
        const matchesFilter = activeFilter === 'all' || l.status === activeFilter;
        const query = searchQuery.toLowerCase();
        const matchesSearch = query === '' ||
            (l.contact_first_name && l.contact_first_name.toLowerCase().includes(query)) ||
            (l.contact_last_name && l.contact_last_name.toLowerCase().includes(query)) ||
            (l.contact_email && l.contact_email.toLowerCase().includes(query)) ||
            (l.contact_phone && l.contact_phone.includes(query));
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="page-wrapper">
            <Sidebar active="Leads" />
            <div className="page-main">
                <Topbar />

                <div className="page-content">
                    <div className="page-header">
                        <div className="page-header-left">
                            <h1 className="page-title">Leads</h1>
                            <span className="page-subtitle">{leads.length} total</span>
                        </div>
                        <div className="page-header-right">
                            <div className="ld-search">
                                <svg className="ld-search-icon" width="14" height="14" viewBox="0 0 20 20" fill="#9a8f80">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search leads..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button className="btn-primary" onClick={() => setShowNewModal(true)}>
                                + New Lead
                            </button>
                        </div>
                    </div>

                    <div className="ld-filters">
                        <button className={`ld-filter ${activeFilter === 'all' ? 'on' : ''}`} onClick={() => setActiveFilter('all')}>All</button>
                        <button className={`ld-filter ${activeFilter === 'working' ? 'on' : ''}`} onClick={() => setActiveFilter('working')}>Working</button>
                        <button className={`ld-filter ${activeFilter === 'qualified' ? 'on' : ''}`} onClick={() => setActiveFilter('qualified')}>Qualified</button>
                        <button className={`ld-filter ${activeFilter === 'converted' ? 'on' : ''}`} onClick={() => setActiveFilter('converted')}>Converted</button>
                        <button className={`ld-filter ${activeFilter === 'lost' ? 'on' : ''}`} onClick={() => setActiveFilter('lost')}>Lost</button>
                    </div>

                    <div className="ld-panel">
                        {loading && (
                            <div className="ld-state ld-state-loading">
                                <div className="ld-spinner"></div>
                                <span>Searching leads...</span>
                            </div>
                        )}

                        {!loading && error && (
                            <div className="ld-state ld-state-error">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                    <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    <circle cx="12" cy="16" r="1" fill="currentColor"/>
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        {!loading && !error && filteredLeads.length === 0 && (
                            <div className="ld-empty">
                                <div className="ld-empty-icon">
                                    <svg width="48" height="48" viewBox="0 0 20 20" fill="#d4c7b3">
                                        <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z"/>
                                    </svg>
                                </div>
                                <div className="ld-empty-title">
                                    {searchQuery ? 'No leads match your search' : activeFilter !== 'all' ? `No ${activeFilter} leads` : 'No leads assigned'}
                                </div>
                                <div className="ld-empty-sub">
                                    {searchQuery ? 'Try a different search term' : activeFilter !== 'all' ? `There are no leads with status "${activeFilter}"` : 'You have no leads assigned to you yet. Ask your admin to assign some.'}
                                </div>
                            </div>
                        )}

                        {!loading && !error && filteredLeads.length > 0 && (
                            <table className="ld-table">
                                <thead>
                                    <tr>
                                        <th>Contact</th>
                                        <th>Loan Purpose</th>
                                        <th>Source</th>
                                        <th>Status</th>
                                        <th>Assigned To</th>
                                        <th>Created</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLeads.map(lead => (
                                        <tr
                                            key={lead.id}
                                            onClick={() => navigate(`/office/leads/${lead.id}`)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <td>
                                                <div className="ld-row">
                                                    <div className="ld-av">
                                                        {lead.contact_first_name?.[0]}{lead.contact_last_name?.[0]}
                                                    </div>
                                                    <div>
                                                        <div className="ld-name">
                                                            {lead.contact_first_name} {lead.contact_last_name}
                                                        </div>
                                                        <div className="ld-sub">{lead.contact_email || lead.contact_phone || '-'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                {lead.loan_purpose
                                                    ? <span className="ld-badge ld-purpose">{lead.loan_purpose}</span>
                                                    : <span className="ld-muted">Not set</span>}
                                            </td>
                                            <td><span className={`ld-badge ld-src-${lead.contact_source}`}>{lead.contact_source}</span></td>
                                            <td><span className={`ld-badge ld-st-${lead.status}`}>{lead.status}</span></td>
                                            <td>
                                                {lead.assigned_first_name
                                                    ? `${lead.assigned_first_name} ${lead.assigned_last_name}`
                                                    : <span className="ld-muted">Unassigned</span>}
                                            </td>
                                            <td className="ld-date">{new Date(lead.created_at).toLocaleDateString()}</td>
                                            <td className="ld-actions-cell" onClick={(e) => e.stopPropagation()}>
                                                <div className="ld-menu-wrapper" ref={openMenuId === lead.id ? menuRef : null}>
                                                    <button
                                                        className="ld-menu-btn"
                                                        onClick={() => setOpenMenuId(openMenuId === lead.id ? null : lead.id)}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                        </svg>
                                                    </button>
                                                    {openMenuId === lead.id && (
                                                        <div className="ld-menu">
                                                            <button
                                                                className={`ld-menu-item ${lead.status === 'converted' ? 'ld-menu-item-disabled' : ''}`}
                                                                disabled={lead.status === 'converted'}
                                                                onClick={() => handleMenuAction('convert', lead)}
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zm14 5H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
                                                                </svg>
                                                                Convert to Loan
                                                                {lead.status === 'converted' && <span className="ld-menu-soon">Done</span>}
                                                            </button>
                                                            <button
                                                                className="ld-menu-item"
                                                                onClick={() => handleMenuAction('qualified', lead)}
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                                                </svg>
                                                                Mark as Qualified
                                                            </button>
                                                            <button
                                                                className="ld-menu-item"
                                                                onClick={() => handleMenuAction('lost', lead)}
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                                                                </svg>
                                                                Mark as Lost
                                                            </button>
                                                            <div className="ld-menu-divider"></div>
                                                            <button
                                                                className="ld-menu-item ld-menu-item-danger"
                                                                onClick={() => handleMenuAction('delete', lead)}
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

            {showNewModal && (
                <div className="ld-modal-overlay" onClick={() => setShowNewModal(false)}>
                    <div className="ld-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ld-modal-head">
                            <h2>New Lead</h2>
                            <button className="ld-modal-close" onClick={() => setShowNewModal(false)}>×</button>
                        </div>

                        <form onSubmit={handleCreateLead} className="ld-form">
                            <div className="ld-field">
                                <label>Select Contact *</label>
                                <CustomSelect
                                    name="contact_id"
                                    value={selectedContactId}
                                    onChange={(e) => setSelectedContactId(e.target.value)}
                                    options={[
                                        { value: '', label: '— Select a contact —' },
                                        ...contacts.map(c => ({
                                            value: String(c.id),
                                            label: `${c.first_name} ${c.last_name}${c.email ? ` (${c.email})` : ''}`
                                        }))
                                    ]}
                                />
                                <p className="ld-field-hint">
                                    Don't see your contact? Add it first from the Contacts section.
                                </p>
                            </div>

                            <div className="ld-modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowNewModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={!selectedContactId}>
                                    Create Lead
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {leadToDelete && (
                <div className="ld-modal-overlay" onClick={() => setLeadToDelete(null)}>
                    <div className="ld-confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ld-confirm-icon ld-confirm-icon-danger">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                <line x1="12" y1="8" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                <circle cx="12" cy="16.5" r="1" fill="currentColor"/>
                            </svg>
                        </div>
                        <h2 className="ld-confirm-title">Delete lead</h2>
                        <p className="ld-confirm-text">
                            Are you sure you want to delete this lead for <strong>{leadToDelete.contact_first_name} {leadToDelete.contact_last_name}</strong>? The contact will not be affected. This action cannot be undone.
                        </p>
                        <div className="ld-confirm-actions">
                            <button className="btn-secondary" onClick={() => setLeadToDelete(null)}>
                                Cancel
                            </button>
                            <button className="ld-confirm-delete-btn" onClick={handleConfirmDelete}>
                                Delete lead
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {leadToConvert && (
                <div className="ld-modal-overlay" onClick={() => !converting && setLeadToConvert(null)}>
                    <div className="ld-confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ld-confirm-icon" style={{ color: 'var(--color-primary)' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                                <path d="M2 10h20" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                        </div>
                        <h2 className="ld-confirm-title">Convert to Loan</h2>
                        <p className="ld-confirm-text">
                            Create a loan application for <strong>{leadToConvert.contact_first_name} {leadToConvert.contact_last_name}</strong>? The lead will be marked as converted and you can fill in the full loan details on the loan page.
                        </p>
                        <div className="ld-confirm-actions">
                            <button className="btn-secondary" onClick={() => setLeadToConvert(null)} disabled={converting}>
                                Cancel
                            </button>
                            <button className="btn-primary" onClick={handleConvertToLoan} disabled={converting}>
                                {converting ? 'Creating...' : 'Create Loan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {successMessage && (
                <div className="ld-toast">
                    <div className="ld-toast-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </div>
                    <div className="ld-toast-text">{successMessage}</div>
                    <button className="ld-toast-close" onClick={() => setSuccessMessage(null)}>×</button>
                </div>
            )}
        </div>
    );
}

export default Leads;