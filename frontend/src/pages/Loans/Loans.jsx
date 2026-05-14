import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import { getLoans, deleteLoan } from '../../services/loansService';
import './Loans.css';

const STATUS_FILTERS = [
    { value: 'all',          label: 'All' },
    { value: 'in_progress',  label: 'In Progress' },
    { value: 'processing',   label: 'Processing' },
    { value: 'underwriting', label: 'Underwriting' },
    { value: 'approved',     label: 'Approved' },
    { value: 'closed',       label: 'Closed' },
    { value: 'denied',       label: 'Denied' },
];

function formatAmount(val) {
    if (!val) return '—';
    return '$' + Number(val).toLocaleString('en-US', { minimumFractionDigits: 0 });
}

function Loans() {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [openMenuId, setOpenMenuId] = useState(null);
    const [loanToDelete, setLoanToDelete] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    const loadLoans = async () => {
        try {
            setLoading(true);
            const data = await getLoans();
            setLoans(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadLoans(); }, []);

    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
        };
        if (openMenuId !== null) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [openMenuId]);

    useEffect(() => {
        if (successMessage) {
            const t = setTimeout(() => setSuccessMessage(null), 4000);
            return () => clearTimeout(t);
        }
    }, [successMessage]);

    const handleConfirmDelete = async () => {
        if (!loanToDelete) return;
        try {
            await deleteLoan(loanToDelete.id);
            setLoanToDelete(null);
            setSuccessMessage('Loan deleted.');
            loadLoans();
        } catch (err) {
            setError(err.message);
            setLoanToDelete(null);
        }
    };

    const filteredLoans = loans.filter(l => {
        const matchFilter = activeFilter === 'all' || l.status === activeFilter;
        const q = searchQuery.toLowerCase();
        const matchSearch = q === '' ||
            (l.contact_first_name && l.contact_first_name.toLowerCase().includes(q)) ||
            (l.contact_last_name  && l.contact_last_name.toLowerCase().includes(q)) ||
            (l.contact_email      && l.contact_email.toLowerCase().includes(q));
        return matchFilter && matchSearch;
    });

    return (
        <div className="page-wrapper">
            <Sidebar active="Loans" />
            <div className="page-main">
                <Topbar />
                <div className="page-content">

                    <div className="page-header">
                        <div className="page-header-left">
                            <h1 className="page-title">Loans</h1>
                            <span className="page-subtitle">{loans.length} total</span>
                        </div>
                        <div className="page-header-right">
                            <div className="ln-search">
                                <svg className="ln-search-icon" width="14" height="14" viewBox="0 0 20 20" fill="#9a8f80">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search loans..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="ln-filters">
                        {STATUS_FILTERS.map(f => (
                            <button
                                key={f.value}
                                className={`ln-filter ${activeFilter === f.value ? 'on' : ''}`}
                                onClick={() => setActiveFilter(f.value)}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <div className="ln-panel">
                        {loading && (
                            <div className="ln-state ln-state-loading">
                                <div className="ln-spinner"></div>
                                <span>Loading loans...</span>
                            </div>
                        )}

                        {!loading && error && (
                            <div className="ln-state ln-state-error">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                    <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    <circle cx="12" cy="16" r="1" fill="currentColor"/>
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        {!loading && !error && filteredLoans.length === 0 && (
                            <div className="ln-empty">
                                <div className="ln-empty-icon">
                                    <svg width="48" height="48" viewBox="0 0 20 20" fill="#d4c7b3">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zm14 5H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
                                    </svg>
                                </div>
                                <div className="ln-empty-title">
                                    {searchQuery ? 'No loans match your search' : activeFilter !== 'all' ? `No ${activeFilter} loans` : 'No loans assigned'}
                                </div>
                                <div className="ln-empty-sub">
                                    {searchQuery ? 'Try a different search term' : activeFilter !== 'all' ? `There are no loans with status "${activeFilter}"` : 'You have no loans assigned to you yet. Ask your admin to assign some.'}
                                </div>
                            </div>
                        )}

                        {!loading && !error && filteredLoans.length > 0 && (
                            <table className="ln-table">
                                <thead>
                                    <tr>
                                        <th>Borrower</th>
                                        <th>Purpose</th>
                                        <th>Type</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Assigned To</th>
                                        <th>Created</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLoans.map(loan => (
                                        <tr
                                            key={loan.id}
                                            onClick={() => navigate(`/office/loans/${loan.id}`)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <td>
                                                <div className="ln-row">
                                                    <div className="ln-av">
                                                        {loan.contact_first_name?.[0]}{loan.contact_last_name?.[0]}
                                                    </div>
                                                    <div>
                                                        <div className="ln-name">
                                                            {loan.contact_first_name} {loan.contact_last_name}
                                                        </div>
                                                        <div className="ln-sub">{loan.contact_email || loan.contact_phone || '—'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                {loan.loan_purpose
                                                    ? <span className={`ln-badge ln-purpose-${loan.loan_purpose}`}>{loan.loan_purpose}</span>
                                                    : <span className="ln-muted">—</span>}
                                            </td>
                                            <td>
                                                {loan.loan_type
                                                    ? <span className="ln-badge ln-type">{loan.loan_type.toUpperCase()}</span>
                                                    : <span className="ln-muted">—</span>}
                                            </td>
                                            <td className="ln-amount">{formatAmount(loan.base_loan_amount)}</td>
                                            <td><span className={`ln-badge ln-st-${loan.status}`}>{loan.status?.replace('_', ' ')}</span></td>
                                            <td>
                                                {loan.assigned_first_name
                                                    ? `${loan.assigned_first_name} ${loan.assigned_last_name}`
                                                    : <span className="ln-muted">Unassigned</span>}
                                            </td>
                                            <td className="ln-date">{new Date(loan.created_at).toLocaleDateString()}</td>
                                            <td className="ln-actions-cell" onClick={(e) => e.stopPropagation()}>
                                                <div className="ln-menu-wrapper" ref={openMenuId === loan.id ? menuRef : null}>
                                                    <button
                                                        className="ln-menu-btn"
                                                        onClick={() => setOpenMenuId(openMenuId === loan.id ? null : loan.id)}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                                                        </svg>
                                                    </button>
                                                    {openMenuId === loan.id && (
                                                        <div className="ln-menu">
                                                            <button className="ln-menu-item" onClick={() => { setOpenMenuId(null); navigate(`/office/loans/${loan.id}`); }}>
                                                                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"/>
                                                                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"/>
                                                                </svg>
                                                                View / Edit
                                                            </button>
                                                            <div className="ln-menu-divider"></div>
                                                            <button className="ln-menu-item ln-menu-item-danger" onClick={() => { setOpenMenuId(null); setLoanToDelete(loan); }}>
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

            {loanToDelete && (
                <div className="ln-overlay" onClick={() => setLoanToDelete(null)}>
                    <div className="ln-confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ln-confirm-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                <line x1="12" y1="8" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                <circle cx="12" cy="16.5" r="1" fill="currentColor"/>
                            </svg>
                        </div>
                        <h2 className="ln-confirm-title">Delete loan</h2>
                        <p className="ln-confirm-text">
                            Are you sure you want to delete the loan for <strong>{loanToDelete.contact_first_name} {loanToDelete.contact_last_name}</strong>? This action cannot be undone.
                        </p>
                        <div className="ln-confirm-actions">
                            <button className="btn-secondary" onClick={() => setLoanToDelete(null)}>Cancel</button>
                            <button className="ln-delete-btn" onClick={handleConfirmDelete}>Delete loan</button>
                        </div>
                    </div>
                </div>
            )}

            {successMessage && (
                <div className="ln-toast">
                    <div className="ln-toast-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </div>
                    <span>{successMessage}</span>
                    <button onClick={() => setSuccessMessage(null)}>×</button>
                </div>
            )}
        </div>
    );
}

export default Loans;
