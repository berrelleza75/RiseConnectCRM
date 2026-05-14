import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import CustomSelect from '../../components/CustomSelect/CustomSelect';
import { getLoan, updateLoan, addLoanNote, addCoBorrower, deleteCoBorrower } from '../../services/loansService';
import { getOfficeUsers } from '../../services/usersService';
import './LoanDetail.css';

const OPT_STATUS = [
    { value: 'in_progress',  label: 'In Progress' },
    { value: 'processing',   label: 'Processing' },
    { value: 'underwriting', label: 'Underwriting' },
    { value: 'approved',     label: 'Approved' },
    { value: 'closed',       label: 'Closed' },
    { value: 'denied',       label: 'Denied' },
    { value: 'withdrawn',    label: 'Withdrawn' },
];

const OPT_LOAN_PURPOSE = [
    { value: '', label: '— Select —' },
    { value: 'purchase',     label: 'Purchase' },
    { value: 'refinance',    label: 'Refinance' },
    { value: 'cash_out',     label: 'Cash Out' },
    { value: 'construction', label: 'Construction' },
    { value: 'heloc',        label: 'HELOC' },
    { value: 'other',        label: 'Other' },
];

const OPT_LOAN_TYPE = [
    { value: '', label: '— Select —' },
    { value: 'conventional', label: 'Conventional' },
    { value: 'fha',          label: 'FHA' },
    { value: 'va',           label: 'VA' },
    { value: 'usda',         label: 'USDA' },
    { value: 'jumbo',        label: 'Jumbo' },
    { value: 'other',        label: 'Other' },
];

const OPT_AMORTIZATION = [
    { value: '', label: '— Select —' },
    { value: 'fixed', label: 'Fixed Rate' },
    { value: 'arm',   label: 'Adjustable Rate (ARM)' },
];

const OPT_LIEN = [
    { value: '', label: '— Select —' },
    { value: 'first',  label: '1st Lien' },
    { value: 'second', label: '2nd Lien' },
];

const OPT_OCCUPANCY = [
    { value: '', label: '— Select —' },
    { value: 'own',              label: 'Own' },
    { value: 'rent',             label: 'Rent' },
    { value: 'live_with_family', label: 'Live with Family' },
    { value: 'other',            label: 'Other' },
];

const OPT_EMPLOYMENT = [
    { value: '', label: '— Select —' },
    { value: 'employed',      label: 'W-2 Employed' },
    { value: 'self_employed', label: 'Self-Employed' },
    { value: 'retired',       label: 'Retired' },
    { value: 'unemployed',    label: 'Unemployed' },
    { value: 'other',         label: 'Other' },
];

const OPT_BUYING_STAGE = [
    { value: '', label: '— Select —' },
    { value: 'just_looking',    label: 'Just Looking' },
    { value: 'researching',     label: 'Researching' },
    { value: 'offer_made',      label: 'Offer Made' },
    { value: 'under_contract',  label: 'Under Contract' },
    { value: 'closing_soon',    label: 'Closing Soon' },
];

const OPT_REFINANCE_TYPE = [
    { value: '', label: '— Select —' },
    { value: 'rate_term',   label: 'Rate & Term' },
    { value: 'cash_out',    label: 'Cash Out' },
    { value: 'streamline',  label: 'Streamline' },
];

const OPT_LEAD_SOURCE = [
    { value: '', label: '— Select —' },
    { value: 'referral',    label: 'Referral' },
    { value: 'zillow',      label: 'Zillow' },
    { value: 'realtor_com', label: 'Realtor.com' },
    { value: 'website',     label: 'Website' },
    { value: 'social_media',label: 'Social Media' },
    { value: 'open_house',  label: 'Open House' },
    { value: 'cold_call',   label: 'Cold Call' },
    { value: 'other',       label: 'Other' },
];

const OPT_PROPERTY_TYPE = [
    { value: '', label: '— Select —' },
    { value: 'single_family', label: 'Single Family' },
    { value: 'condo',         label: 'Condo' },
    { value: 'townhouse',     label: 'Townhouse' },
    { value: 'multi_family',  label: 'Multi-Family' },
    { value: 'manufactured',  label: 'Manufactured' },
    { value: 'land',          label: 'Land' },
    { value: 'other',         label: 'Other' },
];

const OPT_PROPERTY_OCC = [
    { value: '', label: '— Select —' },
    { value: 'primary_residence', label: 'Primary Residence' },
    { value: 'second_home',       label: 'Second Home' },
    { value: 'investment',        label: 'Investment Property' },
];

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
    'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY',
    'NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];
const OPT_STATES = [{ value: '', label: '— State —' }, ...US_STATES.map(s => ({ value: s, label: s }))];

function TriToggle({ name, value, onChange }) {
    return (
        <div className="lnd-tri">
            <button type="button" className={`lnd-tri-btn ${value === true ? 'on' : ''}`}
                onClick={() => onChange(name, value === true ? null : true)}>Yes</button>
            <button type="button" className={`lnd-tri-btn ${value === false ? 'on' : ''}`}
                onClick={() => onChange(name, value === false ? null : false)}>No</button>
            <button type="button" className={`lnd-tri-btn ${value === null ? 'on' : ''}`}
                onClick={() => onChange(name, null)}>—</button>
        </div>
    );
}

function toBool(val) {
    if (val === 1 || val === true) return true;
    if (val === 0 || val === false) return false;
    return null;
}

function fmtDate(val) {
    if (!val) return '';
    return String(val).substring(0, 10);
}

function initForm(loan) {
    return {
        status: loan.status || 'in_progress',
        denied_reason: loan.denied_reason || '',
        dnc_request: !!loan.dnc_request,
        email_opt_out: !!loan.email_opt_out,
        sms_opt_out: !!loan.sms_opt_out,
        ssn: loan.ssn || '',
        date_of_birth: fmtDate(loan.date_of_birth),
        military_service: toBool(loan.military_service),
        current_address_street: loan.current_address_street || '',
        current_address_city: loan.current_address_city || '',
        current_address_state: loan.current_address_state || '',
        current_address_postal: loan.current_address_postal || '',
        address_duration_years: loan.address_duration_years ?? '',
        address_duration_months: loan.address_duration_months ?? '',
        current_occupancy: loan.current_occupancy || '',
        monthly_rent_amount: loan.monthly_rent_amount ?? '',
        loan_purpose: loan.loan_purpose || '',
        base_loan_amount: loan.base_loan_amount ?? '',
        purchase_price: loan.purchase_price ?? '',
        appraised_value: loan.appraised_value ?? '',
        loan_type: loan.loan_type || '',
        lien_position: loan.lien_position || '',
        note_rate: loan.note_rate ?? '',
        qualifying_rate: loan.qualifying_rate ?? '',
        amortization_type: loan.amortization_type || '',
        amortization_term_months: loan.amortization_term_months ?? '',
        interest_only: toBool(loan.interest_only),
        interest_only_term_months: loan.interest_only_term_months ?? '',
        impound_waiver: toBool(loan.impound_waiver),
        loan_fico: loan.loan_fico ?? '',
        adjustable_rate: toBool(loan.adjustable_rate),
        initial_adjustment_period_months: loan.initial_adjustment_period_months ?? '',
        subsequent_adjustment_period_months: loan.subsequent_adjustment_period_months ?? '',
        estimated_monthly_hoi: loan.estimated_monthly_hoi ?? '',
        estimated_monthly_property_taxes: loan.estimated_monthly_property_taxes ?? '',
        estimated_monthly_hoa: loan.estimated_monthly_hoa ?? '',
        gross_annual_income: loan.gross_annual_income ?? '',
        employment_type: loan.employment_type || '',
        total_monthly_liability: loan.total_monthly_liability ?? '',
        buying_stage: loan.buying_stage || '',
        desired_monthly_payment: loan.desired_monthly_payment ?? '',
        first_time_home_buyer: toBool(loan.first_time_home_buyer),
        has_real_estate_agent: toBool(loan.has_real_estate_agent),
        refinance_type: loan.refinance_type || '',
        cash_out_purpose: loan.cash_out_purpose || '',
        current_interest_rate: loan.current_interest_rate ?? '',
        currently_owning_home: toBool(loan.currently_owning_home),
        planning_to_sell: toBool(loan.planning_to_sell),
        bankruptcy_last_7_years: toBool(loan.bankruptcy_last_7_years),
        years_since_bankruptcy: loan.years_since_bankruptcy ?? '',
        foreclosure_last_7_years: toBool(loan.foreclosure_last_7_years),
        years_since_foreclosure: loan.years_since_foreclosure ?? '',
        subject_property_tbd: toBool(loan.subject_property_tbd),
        property_street: loan.property_street || '',
        property_city: loan.property_city || '',
        property_county: loan.property_county || '',
        property_postal: loan.property_postal || '',
        property_state: loan.property_state || '',
        property_unit: loan.property_unit || '',
        property_occupancy: loan.property_occupancy || '',
        property_type: loan.property_type || '',
        lead_provided_by: loan.lead_provided_by || '',
        lead_source: loan.lead_source || '',
        other_lead_source_description: loan.other_lead_source_description || '',
        assigned_to: loan.assigned_to ? String(loan.assigned_to) : '',
    };
}

function LoanDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const payload = token ? JSON.parse(atob(token.split('.')[1])) : {};
    const userId = payload.id;
    const officeId = payload.office_id;
    const isAdmin = payload.role === 'admin';

    const [loan, setLoan] = useState(null);
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [error, setError] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [showSSN, setShowSSN] = useState(false);
    const [cobList, setCobList] = useState([]);
    const [showAddCob, setShowAddCob] = useState(false);
    const [addingCob, setAddingCob] = useState(false);
    const [cobForm, setCobForm] = useState({
        first_name: '', last_name: '', email: '', phone: '',
        ssn: '', date_of_birth: '', military_service: null
    });
    const [noteText, setNoteText] = useState('');
    const [notes, setNotes] = useState([]);
    const [addingNote, setAddingNote] = useState(false);
    const [successMsg, setSuccessMsg] = useState(null);
    const [officeUsers, setOfficeUsers] = useState([]);

    useEffect(() => { loadLoan(); }, [id]);

    useEffect(() => {
        if (!officeId) return;
        getOfficeUsers(officeId)
            .then(setOfficeUsers)
            .catch(() => {});
    }, [officeId]);

    useEffect(() => {
        if (successMsg) {
            const t = setTimeout(() => setSuccessMsg(null), 3500);
            return () => clearTimeout(t);
        }
    }, [successMsg]);

    useEffect(() => {
        if (errorMsg) {
            const t = setTimeout(() => setErrorMsg(null), 4000);
            return () => clearTimeout(t);
        }
    }, [errorMsg]);

    const loadLoan = async () => {
        try {
            setLoading(true);
            const data = await getLoan(id);
            setLoan(data);
            setForm(initForm(data));
            setNotes(data.notes || []);
            setCobList(data.co_borrowers || []);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = ({ target: { name, value } }) => {
        setForm(f => ({ ...f, [name]: value }));
        setDirty(true);
    };

    const handleTri = (name, val) => {
        setForm(f => ({ ...f, [name]: val }));
        setDirty(true);
    };

    const handleCheck = ({ target: { name, checked } }) => {
        setForm(f => ({ ...f, [name]: checked }));
        setDirty(true);
    };

    const handleSave = async () => {
        setSaving(true);
        setShowSaveModal(false);
        try {
            await updateLoan(id, form);
            setDirty(false);
            setSuccessMsg('Changes saved successfully.');
        } catch (err) {
            setErrorMsg(err.message || 'Error saving changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!noteText.trim()) return;
        setAddingNote(true);
        try {
            await addLoanNote(id, noteText.trim(), userId);
            setNoteText('');
            await loadLoan();
        } catch (err) {
            setError(err.message);
        } finally {
            setAddingNote(false);
        }
    };

    const handleAddCob = async (e) => {
        e.preventDefault();
        setAddingCob(true);
        try {
            await addCoBorrower(id, cobForm);
            setCobForm({ first_name: '', last_name: '', email: '', phone: '', ssn: '', date_of_birth: '', military_service: null });
            setShowAddCob(false);
            await loadLoan();
        } catch (err) {
            setError(err.message);
        } finally {
            setAddingCob(false);
        }
    };

    const handleDeleteCob = async (cobId) => {
        try {
            await deleteCoBorrower(id, cobId);
            await loadLoan();
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return (
        <div className="page-wrapper">
            <Sidebar active="Loans" />
            <div className="page-main">
                <Topbar />
                <div className="page-content"><div className="lnd-loading">Loading loan...</div></div>
            </div>
        </div>
    );

    if (!loan) return (
        <div className="page-wrapper">
            <Sidebar active="Loans" />
            <div className="page-main">
                <Topbar />
                <div className="page-content"><div className="lnd-error">{error || 'Loan not found'}</div></div>
            </div>
        </div>
    );

    return (
        <>
        <div className="page-wrapper">
            <Sidebar active="Loans" />
            <div className="page-main">
                <Topbar />
                <div className="page-content">

                    <div className="lnd-hd">
                        <div className="lnd-hd-left">
                            <button className="lnd-back" onClick={() => navigate('/office/loans')}>
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
                                </svg>
                                Loans
                            </button>
                            <div className="lnd-hd-title-row">
                                <h1 className="lnd-title">{loan.contact_first_name} {loan.contact_last_name}</h1>
                                <span className={`lnd-st-badge lnd-st-${form.status}`}>
                                    {form.status?.replace(/_/g, ' ')}
                                </span>
                            </div>
                        </div>
                        <button
                            className="btn-primary"
                            onClick={() => setShowSaveModal(true)}
                            disabled={saving || !dirty}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>

                    <div className="lnd-layout">
                        <aside className="lnd-sidebar">
                            <div className="lnd-card">
                                <div className="lnd-card-hd">Borrower</div>
                                <div className="lnd-contact-av">
                                    {loan.contact_first_name?.[0]}{loan.contact_last_name?.[0]}
                                </div>
                                <div className="lnd-contact-name">{loan.contact_first_name} {loan.contact_last_name}</div>
                                {loan.contact_email && <div className="lnd-contact-info">{loan.contact_email}</div>}
                                {loan.contact_phone && <div className="lnd-contact-info">{loan.contact_phone}</div>}
                            </div>

                            <div className="lnd-card">
                                <div className="lnd-card-hd">Loan Status</div>
                                <CustomSelect
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    options={OPT_STATUS}
                                />
                                {form.status === 'denied' && (
                                    <div className="lnd-field" style={{ marginTop: 10 }}>
                                        <label>Denied Reason</label>
                                        <textarea
                                            name="denied_reason"
                                            value={form.denied_reason || ''}
                                            onChange={handleChange}
                                            rows={3}
                                            className="lnd-textarea"
                                            placeholder="Reason for denial..."
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="lnd-card">
                                <div className="lnd-card-hd">Compliance</div>
                                <label className="lnd-check">
                                    <input type="checkbox" name="dnc_request" checked={!!form.dnc_request} onChange={handleCheck} />
                                    <span>DNC Request</span>
                                </label>
                                <label className="lnd-check">
                                    <input type="checkbox" name="email_opt_out" checked={!!form.email_opt_out} onChange={handleCheck} />
                                    <span>Email Opt-Out</span>
                                </label>
                                <label className="lnd-check">
                                    <input type="checkbox" name="sms_opt_out" checked={!!form.sms_opt_out} onChange={handleCheck} />
                                    <span>SMS Opt-Out</span>
                                </label>
                            </div>

                            <div className="lnd-card">
                                <div className="lnd-card-hd">Team Assignment</div>
                                <div className="lnd-field">
                                    <label>Loan Officer Assigned</label>
                                    <div className="lnd-readonly">{loan.assigned_first_name ? `${loan.assigned_first_name} ${loan.assigned_last_name}` : '— Not assigned —'}</div>
                                    <div className="lnd-readonly-hint">Manage assignment from the contact profile</div>
                                </div>
                                <div className="lnd-field" style={{ marginTop: 10 }}>
                                    <label>Realtor Assigned</label>
                                    <div className="lnd-readonly">{loan.realtor_first_name ? `${loan.realtor_first_name} ${loan.realtor_last_name}` : '— Not assigned —'}</div>
                                    <div className="lnd-readonly-hint">Manage assignment from the contact profile</div>
                                </div>
                            </div>
                        </aside>

                        <div className="lnd-main">

                            <div className="lnd-section">
                                <div className="lnd-section-hd">Borrower Information</div>
                                <div className="lnd-g2">
                                    <div className="lnd-field">
                                        <label>SSN</label>
                                        <div className="lnd-input-wrap">
                                            <input
                                                type={showSSN ? 'text' : 'password'}
                                                name="ssn"
                                                value={form.ssn || ''}
                                                onChange={handleChange}
                                                placeholder="XXX-XX-XXXX"
                                                className="lnd-input-icon-r"
                                            />
                                            <button type="button" className="lnd-eye" onClick={() => setShowSSN(s => !s)}>
                                                {showSSN
                                                    ? <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                                                    : <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/></svg>
                                                }
                                            </button>
                                        </div>
                                    </div>
                                    <div className="lnd-field">
                                        <label>Date of Birth</label>
                                        <input type="date" name="date_of_birth" value={form.date_of_birth || ''} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="lnd-field">
                                    <label>Military Service</label>
                                    <TriToggle name="military_service" value={form.military_service} onChange={handleTri} />
                                </div>
                                <div className="lnd-section-sub">Current Address</div>
                                <div className="lnd-field">
                                    <label>Street</label>
                                    <input type="text" name="current_address_street" value={form.current_address_street || ''} onChange={handleChange} placeholder="123 Main St" />
                                </div>
                                <div className="lnd-g3">
                                    <div className="lnd-field">
                                        <label>City</label>
                                        <input type="text" name="current_address_city" value={form.current_address_city || ''} onChange={handleChange} />
                                    </div>
                                    <div className="lnd-field">
                                        <label>State</label>
                                        <CustomSelect name="current_address_state" value={form.current_address_state} onChange={handleChange} options={OPT_STATES} />
                                    </div>
                                    <div className="lnd-field">
                                        <label>ZIP</label>
                                        <input type="text" name="current_address_postal" value={form.current_address_postal || ''} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="lnd-g2">
                                    <div className="lnd-field">
                                        <label>Years at Address</label>
                                        <input type="number" name="address_duration_years" value={form.address_duration_years ?? ''} onChange={handleChange} min="0" />
                                    </div>
                                    <div className="lnd-field">
                                        <label>Months at Address</label>
                                        <input type="number" name="address_duration_months" value={form.address_duration_months ?? ''} onChange={handleChange} min="0" max="11" />
                                    </div>
                                </div>
                                <div className="lnd-g2">
                                    <div className="lnd-field">
                                        <label>Current Occupancy</label>
                                        <CustomSelect name="current_occupancy" value={form.current_occupancy} onChange={handleChange} options={OPT_OCCUPANCY} />
                                    </div>
                                    {form.current_occupancy === 'rent' && (
                                        <div className="lnd-field">
                                            <label>Monthly Rent Amount</label>
                                            <div className="lnd-pfx-wrap">
                                                <span className="lnd-pfx">$</span>
                                                <input type="number" name="monthly_rent_amount" value={form.monthly_rent_amount ?? ''} onChange={handleChange} min="0" className="lnd-pfx-input" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="lnd-section">
                                <div className="lnd-section-hd">Mortgage Details</div>
                                <div className="lnd-g2">
                                    <div className="lnd-field">
                                        <label>Loan Purpose</label>
                                        <CustomSelect name="loan_purpose" value={form.loan_purpose} onChange={handleChange} options={OPT_LOAN_PURPOSE} />
                                    </div>
                                    <div className="lnd-field">
                                        <label>Loan Type</label>
                                        <CustomSelect name="loan_type" value={form.loan_type} onChange={handleChange} options={OPT_LOAN_TYPE} />
                                    </div>
                                </div>
                                <div className="lnd-g3">
                                    <div className="lnd-field">
                                        <label>Base Loan Amount</label>
                                        <div className="lnd-pfx-wrap">
                                            <span className="lnd-pfx">$</span>
                                            <input type="number" name="base_loan_amount" value={form.base_loan_amount ?? ''} onChange={handleChange} min="0" className="lnd-pfx-input" />
                                        </div>
                                    </div>
                                    <div className="lnd-field">
                                        <label>Purchase Price</label>
                                        <div className="lnd-pfx-wrap">
                                            <span className="lnd-pfx">$</span>
                                            <input type="number" name="purchase_price" value={form.purchase_price ?? ''} onChange={handleChange} min="0" className="lnd-pfx-input" />
                                        </div>
                                    </div>
                                    <div className="lnd-field">
                                        <label>Appraised Value</label>
                                        <div className="lnd-pfx-wrap">
                                            <span className="lnd-pfx">$</span>
                                            <input type="number" name="appraised_value" value={form.appraised_value ?? ''} onChange={handleChange} min="0" className="lnd-pfx-input" />
                                        </div>
                                    </div>
                                </div>
                                <div className="lnd-g3">
                                    <div className="lnd-field">
                                        <label>Lien Position</label>
                                        <CustomSelect name="lien_position" value={form.lien_position} onChange={handleChange} options={OPT_LIEN} />
                                    </div>
                                    <div className="lnd-field">
                                        <label>Loan FICO</label>
                                        <input type="number" name="loan_fico" value={form.loan_fico ?? ''} onChange={handleChange} min="300" max="850" placeholder="720" />
                                    </div>
                                    <div className="lnd-field">
                                        <label>Amortization Type</label>
                                        <CustomSelect name="amortization_type" value={form.amortization_type} onChange={handleChange} options={OPT_AMORTIZATION} />
                                    </div>
                                </div>
                                <div className="lnd-g3">
                                    <div className="lnd-field">
                                        <label>Note Rate</label>
                                        <div className="lnd-sfx-wrap">
                                            <input type="number" name="note_rate" value={form.note_rate ?? ''} onChange={handleChange} step="0.001" min="0" className="lnd-sfx-input" placeholder="6.500" />
                                            <span className="lnd-sfx">%</span>
                                        </div>
                                    </div>
                                    <div className="lnd-field">
                                        <label>Qualifying Rate</label>
                                        <div className="lnd-sfx-wrap">
                                            <input type="number" name="qualifying_rate" value={form.qualifying_rate ?? ''} onChange={handleChange} step="0.001" min="0" className="lnd-sfx-input" placeholder="7.000" />
                                            <span className="lnd-sfx">%</span>
                                        </div>
                                    </div>
                                    <div className="lnd-field">
                                        <label>Amort. Term (months)</label>
                                        <input type="number" name="amortization_term_months" value={form.amortization_term_months ?? ''} onChange={handleChange} min="0" placeholder="360" />
                                    </div>
                                </div>
                                <div className="lnd-g2">
                                    <div className="lnd-field">
                                        <label>Interest Only</label>
                                        <TriToggle name="interest_only" value={form.interest_only} onChange={handleTri} />
                                    </div>
                                    {form.interest_only === true && (
                                        <div className="lnd-field">
                                            <label>Interest Only Term (months)</label>
                                            <input type="number" name="interest_only_term_months" value={form.interest_only_term_months ?? ''} onChange={handleChange} min="0" />
                                        </div>
                                    )}
                                </div>
                                <div className="lnd-field">
                                    <label>Impound Waiver</label>
                                    <TriToggle name="impound_waiver" value={form.impound_waiver} onChange={handleTri} />
                                </div>
                            </div>

                            {form.amortization_type === 'arm' && (
                                <div className="lnd-section">
                                    <div className="lnd-section-hd">ARM Details</div>
                                    <div className="lnd-field">
                                        <label>Adjustable Rate</label>
                                        <TriToggle name="adjustable_rate" value={form.adjustable_rate} onChange={handleTri} />
                                    </div>
                                    <div className="lnd-g2">
                                        <div className="lnd-field">
                                            <label>Initial Adjustment Period (months)</label>
                                            <input type="number" name="initial_adjustment_period_months" value={form.initial_adjustment_period_months ?? ''} onChange={handleChange} min="0" />
                                        </div>
                                        <div className="lnd-field">
                                            <label>Subsequent Adjustment Period (months)</label>
                                            <input type="number" name="subsequent_adjustment_period_months" value={form.subsequent_adjustment_period_months ?? ''} onChange={handleChange} min="0" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="lnd-section">
                                <div className="lnd-section-hd">Monthly Costs</div>
                                <div className="lnd-g3">
                                    <div className="lnd-field">
                                        <label>Estimated Monthly HOI</label>
                                        <div className="lnd-pfx-wrap">
                                            <span className="lnd-pfx">$</span>
                                            <input type="number" name="estimated_monthly_hoi" value={form.estimated_monthly_hoi ?? ''} onChange={handleChange} min="0" className="lnd-pfx-input" />
                                        </div>
                                    </div>
                                    <div className="lnd-field">
                                        <label>Est. Monthly Property Taxes</label>
                                        <div className="lnd-pfx-wrap">
                                            <span className="lnd-pfx">$</span>
                                            <input type="number" name="estimated_monthly_property_taxes" value={form.estimated_monthly_property_taxes ?? ''} onChange={handleChange} min="0" className="lnd-pfx-input" />
                                        </div>
                                    </div>
                                    <div className="lnd-field">
                                        <label>Estimated Monthly HOA</label>
                                        <div className="lnd-pfx-wrap">
                                            <span className="lnd-pfx">$</span>
                                            <input type="number" name="estimated_monthly_hoa" value={form.estimated_monthly_hoa ?? ''} onChange={handleChange} min="0" className="lnd-pfx-input" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lnd-section">
                                <div className="lnd-section-hd">Income & Debts</div>
                                <div className="lnd-g3">
                                    <div className="lnd-field">
                                        <label>Gross Annual Income</label>
                                        <div className="lnd-pfx-wrap">
                                            <span className="lnd-pfx">$</span>
                                            <input type="number" name="gross_annual_income" value={form.gross_annual_income ?? ''} onChange={handleChange} min="0" className="lnd-pfx-input" />
                                        </div>
                                    </div>
                                    <div className="lnd-field">
                                        <label>Employment Type</label>
                                        <CustomSelect name="employment_type" value={form.employment_type} onChange={handleChange} options={OPT_EMPLOYMENT} />
                                    </div>
                                    <div className="lnd-field">
                                        <label>Total Monthly Liability</label>
                                        <div className="lnd-pfx-wrap">
                                            <span className="lnd-pfx">$</span>
                                            <input type="number" name="total_monthly_liability" value={form.total_monthly_liability ?? ''} onChange={handleChange} min="0" className="lnd-pfx-input" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lnd-section">
                                <div className="lnd-section-hd">Buying Stage</div>
                                <div className="lnd-g2">
                                    <div className="lnd-field">
                                        <label>Buying Stage</label>
                                        <CustomSelect name="buying_stage" value={form.buying_stage} onChange={handleChange} options={OPT_BUYING_STAGE} />
                                    </div>
                                    <div className="lnd-field">
                                        <label>Desired Monthly Payment</label>
                                        <div className="lnd-pfx-wrap">
                                            <span className="lnd-pfx">$</span>
                                            <input type="number" name="desired_monthly_payment" value={form.desired_monthly_payment ?? ''} onChange={handleChange} min="0" className="lnd-pfx-input" />
                                        </div>
                                    </div>
                                </div>
                                <div className="lnd-g2">
                                    <div className="lnd-field">
                                        <label>First Time Home Buyer</label>
                                        <TriToggle name="first_time_home_buyer" value={form.first_time_home_buyer} onChange={handleTri} />
                                    </div>
                                    <div className="lnd-field">
                                        <label>Has Real Estate Agent</label>
                                        <TriToggle name="has_real_estate_agent" value={form.has_real_estate_agent} onChange={handleTri} />
                                    </div>
                                </div>
                            </div>

                            {form.loan_purpose === 'refinance' && (
                                <div className="lnd-section">
                                    <div className="lnd-section-hd">Refinance Details</div>
                                    <div className="lnd-g2">
                                        <div className="lnd-field">
                                            <label>Refinance Type</label>
                                            <CustomSelect name="refinance_type" value={form.refinance_type} onChange={handleChange} options={OPT_REFINANCE_TYPE} />
                                        </div>
                                        <div className="lnd-field">
                                            <label>Current Interest Rate</label>
                                            <div className="lnd-sfx-wrap">
                                                <input type="number" name="current_interest_rate" value={form.current_interest_rate ?? ''} onChange={handleChange} step="0.001" min="0" className="lnd-sfx-input" />
                                                <span className="lnd-sfx">%</span>
                                            </div>
                                        </div>
                                    </div>
                                    {form.refinance_type === 'cash_out' && (
                                        <div className="lnd-field">
                                            <label>Cash Out Purpose</label>
                                            <input type="text" name="cash_out_purpose" value={form.cash_out_purpose || ''} onChange={handleChange} placeholder="e.g. Home improvement, debt consolidation..." />
                                        </div>
                                    )}
                                    <div className="lnd-g2">
                                        <div className="lnd-field">
                                            <label>Currently Owning Home</label>
                                            <TriToggle name="currently_owning_home" value={form.currently_owning_home} onChange={handleTri} />
                                        </div>
                                        <div className="lnd-field">
                                            <label>Planning to Sell</label>
                                            <TriToggle name="planning_to_sell" value={form.planning_to_sell} onChange={handleTri} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="lnd-section">
                                <div className="lnd-section-hd">Bankruptcy / Foreclosure</div>
                                <div className="lnd-g2">
                                    <div className="lnd-field">
                                        <label>Bankruptcy in Last 7 Years</label>
                                        <TriToggle name="bankruptcy_last_7_years" value={form.bankruptcy_last_7_years} onChange={handleTri} />
                                    </div>
                                    {form.bankruptcy_last_7_years === true && (
                                        <div className="lnd-field">
                                            <label>Years Since Bankruptcy</label>
                                            <input type="number" name="years_since_bankruptcy" value={form.years_since_bankruptcy ?? ''} onChange={handleChange} min="0" max="7" />
                                        </div>
                                    )}
                                </div>
                                <div className="lnd-g2">
                                    <div className="lnd-field">
                                        <label>Foreclosure in Last 7 Years</label>
                                        <TriToggle name="foreclosure_last_7_years" value={form.foreclosure_last_7_years} onChange={handleTri} />
                                    </div>
                                    {form.foreclosure_last_7_years === true && (
                                        <div className="lnd-field">
                                            <label>Years Since Foreclosure</label>
                                            <input type="number" name="years_since_foreclosure" value={form.years_since_foreclosure ?? ''} onChange={handleChange} min="0" max="7" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="lnd-section">
                                <div className="lnd-section-hd">Subject Property</div>
                                <div className="lnd-field">
                                    <label>Property TBD (To Be Determined)</label>
                                    <TriToggle name="subject_property_tbd" value={form.subject_property_tbd} onChange={handleTri} />
                                </div>
                                {form.subject_property_tbd !== true && (
                                    <>
                                        <div className="lnd-g2">
                                            <div className="lnd-field">
                                                <label>Street Address</label>
                                                <input type="text" name="property_street" value={form.property_street || ''} onChange={handleChange} placeholder="123 Main St" />
                                            </div>
                                            <div className="lnd-field">
                                                <label>Unit / Apt</label>
                                                <input type="text" name="property_unit" value={form.property_unit || ''} onChange={handleChange} placeholder="Unit 4B" />
                                            </div>
                                        </div>
                                        <div className="lnd-g2">
                                            <div className="lnd-field">
                                                <label>City</label>
                                                <input type="text" name="property_city" value={form.property_city || ''} onChange={handleChange} />
                                            </div>
                                            <div className="lnd-field">
                                                <label>County</label>
                                                <input type="text" name="property_county" value={form.property_county || ''} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="lnd-g2">
                                            <div className="lnd-field">
                                                <label>State</label>
                                                <CustomSelect name="property_state" value={form.property_state} onChange={handleChange} options={OPT_STATES} />
                                            </div>
                                            <div className="lnd-field">
                                                <label>ZIP Code</label>
                                                <input type="text" name="property_postal" value={form.property_postal || ''} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </>
                                )}
                                <div className="lnd-g2">
                                    <div className="lnd-field">
                                        <label>Property Occupancy</label>
                                        <CustomSelect name="property_occupancy" value={form.property_occupancy} onChange={handleChange} options={OPT_PROPERTY_OCC} />
                                    </div>
                                    <div className="lnd-field">
                                        <label>Property Type</label>
                                        <CustomSelect name="property_type" value={form.property_type} onChange={handleChange} options={OPT_PROPERTY_TYPE} />
                                    </div>
                                </div>
                            </div>

                            <div className="lnd-section">
                                <div className="lnd-section-hd">Lead Origin</div>
                                <div className="lnd-g2">
                                    <div className="lnd-field">
                                        <label>Lead Provided By</label>
                                        <input type="text" name="lead_provided_by" value={form.lead_provided_by || ''} onChange={handleChange} placeholder="Name or organization" />
                                    </div>
                                    <div className="lnd-field">
                                        <label>Lead Source</label>
                                        <CustomSelect name="lead_source" value={form.lead_source} onChange={handleChange} options={OPT_LEAD_SOURCE} />
                                    </div>
                                </div>
                                {form.lead_source === 'other' && (
                                    <div className="lnd-field">
                                        <label>Other Source Description</label>
                                        <input type="text" name="other_lead_source_description" value={form.other_lead_source_description || ''} onChange={handleChange} />
                                    </div>
                                )}
                            </div>

                            <div className="lnd-section">
                                <div className="lnd-section-hd-row">
                                    <span className="lnd-section-hd lnd-section-hd-inline">Co-Borrowers</span>
                                    <button type="button" className="lnd-add-btn" onClick={() => setShowAddCob(true)}>
                                        + Add Co-Borrower
                                    </button>
                                </div>
                                {cobList.length === 0 ? (
                                    <div className="lnd-empty-note">No co-borrowers added yet.</div>
                                ) : (
                                    <div className="lnd-cob-list">
                                        {cobList.map(cob => (
                                            <div key={cob.id} className="lnd-cob-item">
                                                <div className="lnd-cob-av">{cob.first_name?.[0]}{cob.last_name?.[0]}</div>
                                                <div className="lnd-cob-info">
                                                    <div className="lnd-cob-name">{cob.first_name} {cob.last_name}</div>
                                                    <div className="lnd-cob-sub">{cob.email || cob.phone || '—'}</div>
                                                </div>
                                                <button type="button" className="lnd-cob-del" onClick={() => handleDeleteCob(cob.id)}>
                                                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="lnd-section">
                                <div className="lnd-section-hd">Notes</div>
                                <form onSubmit={handleAddNote} className="lnd-note-form">
                                    <textarea
                                        className="lnd-note-input"
                                        value={noteText}
                                        onChange={(e) => setNoteText(e.target.value)}
                                        placeholder="Add a note..."
                                        rows={3}
                                    />
                                    <button type="submit" className="btn-primary" disabled={!noteText.trim() || addingNote}>
                                        {addingNote ? 'Adding...' : 'Add Note'}
                                    </button>
                                </form>
                                {notes.length > 0 && (
                                    <div className="lnd-notes-list">
                                        {notes.map(n => (
                                            <div key={n.id} className="lnd-note">
                                                <div className="lnd-note-meta">
                                                    <span className="lnd-note-author">{n.first_name} {n.last_name}</span>
                                                    <span className="lnd-note-date">{new Date(n.created_at).toLocaleString()}</span>
                                                </div>
                                                <div className="lnd-note-text">{n.text}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

            {showAddCob && (
                <div className="lnd-overlay" onClick={() => setShowAddCob(false)}>
                    <div className="lnd-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="lnd-modal-hd">
                            <h2>Add Co-Borrower</h2>
                            <button className="lnd-modal-close" onClick={() => setShowAddCob(false)}>×</button>
                        </div>
                        <form onSubmit={handleAddCob}>
                            <div className="lnd-g2">
                                <div className="lnd-field">
                                    <label>First Name *</label>
                                    <input type="text" value={cobForm.first_name} onChange={(e) => setCobForm(f => ({ ...f, first_name: e.target.value }))} required />
                                </div>
                                <div className="lnd-field">
                                    <label>Last Name *</label>
                                    <input type="text" value={cobForm.last_name} onChange={(e) => setCobForm(f => ({ ...f, last_name: e.target.value }))} required />
                                </div>
                            </div>
                            <div className="lnd-g2">
                                <div className="lnd-field">
                                    <label>Email</label>
                                    <input type="email" value={cobForm.email} onChange={(e) => setCobForm(f => ({ ...f, email: e.target.value }))} />
                                </div>
                                <div className="lnd-field">
                                    <label>Phone</label>
                                    <input type="text" value={cobForm.phone} onChange={(e) => setCobForm(f => ({ ...f, phone: e.target.value }))} />
                                </div>
                            </div>
                            <div className="lnd-g2">
                                <div className="lnd-field">
                                    <label>SSN</label>
                                    <input type="password" value={cobForm.ssn} onChange={(e) => setCobForm(f => ({ ...f, ssn: e.target.value }))} placeholder="XXX-XX-XXXX" />
                                </div>
                                <div className="lnd-field">
                                    <label>Date of Birth</label>
                                    <input type="date" value={cobForm.date_of_birth} onChange={(e) => setCobForm(f => ({ ...f, date_of_birth: e.target.value }))} />
                                </div>
                            </div>
                            <div className="lnd-field">
                                <label>Military Service</label>
                                <TriToggle
                                    name="military_service"
                                    value={cobForm.military_service}
                                    onChange={(name, val) => setCobForm(f => ({ ...f, military_service: val }))}
                                />
                            </div>
                            <div className="lnd-modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowAddCob(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={addingCob}>
                                    {addingCob ? 'Adding...' : 'Add Co-Borrower'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showSaveModal && (
                <div className="lnd-overlay" onClick={() => setShowSaveModal(false)}>
                    <div className="lnd-modal lnd-save-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="lnd-save-modal-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                                <polyline points="17 21 17 13 7 13 7 21"/>
                                <polyline points="7 3 7 8 15 8"/>
                            </svg>
                        </div>
                        <h2 className="lnd-save-modal-title">Save changes?</h2>
                        <p className="lnd-save-modal-text">
                            All changes to <strong>{loan.contact_first_name} {loan.contact_last_name}</strong>'s loan will be saved.
                        </p>
                        <div className="lnd-modal-actions">
                            <button className="btn-secondary" onClick={() => setShowSaveModal(false)}>Cancel</button>
                            <button className="lnd-save-confirm-btn" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : 'Yes, save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {successMsg && (
                <div className="lnd-toast">
                    <div className="lnd-toast-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </div>
                    <div className="lnd-toast-text">{successMsg}</div>
                    <button className="lnd-toast-close" onClick={() => setSuccessMsg(null)}>×</button>
                </div>
            )}

            {errorMsg && (
                <div className="lnd-toast lnd-toast-error">
                    <div className="lnd-toast-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                    </div>
                    <div className="lnd-toast-text">{errorMsg}</div>
                    <button className="lnd-toast-close" onClick={() => setErrorMsg(null)}>×</button>
                </div>
            )}
        </>
    );
}

export default LoanDetail;
