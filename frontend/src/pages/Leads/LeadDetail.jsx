import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import CustomSelect from '../../components/CustomSelect/CustomSelect';
import { getLead, updateLead, addLeadNote } from '../../services/leadsService';
import { createLoan } from '../../services/loansService';
import { getOfficeUsers } from '../../services/usersService';
import './LeadDetail.css';

const toBool = (val) => {
    if (val === null || val === undefined) return null;
    return Boolean(val);
};

const initForm = (lead) => ({
    loan_purpose: lead.loan_purpose || '',
    buying_stage: lead.buying_stage || '',
    first_time_home_buyer: toBool(lead.first_time_home_buyer),
    has_real_estate_agent: toBool(lead.has_real_estate_agent),
    desired_monthly_payment: lead.desired_monthly_payment || '',
    subject_property_tbd: toBool(lead.subject_property_tbd),
    street_address: lead.street_address || '',
    unit_apt: lead.unit_apt || '',
    city: lead.city || '',
    state: lead.state || '',
    postal_code: lead.postal_code || '',
    county: lead.county || '',
    property_type: lead.property_type || '',
    property_occupancy: lead.property_occupancy || '',
    purchase_price: lead.purchase_price || '',
    current_interest_rate: lead.current_interest_rate || '',
    currently_owning_home: toBool(lead.currently_owning_home),
    planning_to_sell: toBool(lead.planning_to_sell),
    gross_annual_income: lead.gross_annual_income || '',
    employment_type: lead.employment_type || '',
    credit_score_range: lead.credit_score_range || '',
    military_service: toBool(lead.military_service),
    current_occupancy: lead.current_occupancy || '',
    monthly_rent_amount: lead.monthly_rent_amount || '',
    lead_provided_by: lead.lead_provided_by || '',
    lead_source: lead.lead_source || '',
    other_lead_source_description: lead.other_lead_source_description || '',
    dnc_request: toBool(lead.dnc_request),
    email_opt_out: toBool(lead.email_opt_out),
    sms_opt_out: toBool(lead.sms_opt_out),
    status: lead.status || 'working',
    lost_reason: lead.lost_reason || '',
    assigned_to: lead.assigned_to ? String(lead.assigned_to) : '',
    realtor_id: lead.realtor_id ? String(lead.realtor_id) : '',
});

/* ── Options ── */
const OPT_LOAN_PURPOSE   = [{ value: '', label: '— Not set —' }, { value: 'purchase', label: 'Purchase' }, { value: 'refinance', label: 'Refinance' }, { value: 'other', label: 'Other' }];
const OPT_BUYING_STAGE   = [{ value: '', label: '— Not set —' }, { value: 'just_looking', label: 'Just Looking' }, { value: 'making_offers', label: 'Making Offers' }, { value: 'under_contract', label: 'Under Contract' }];
const OPT_PROPERTY_TYPE  = [{ value: '', label: '— Not set —' }, { value: 'single_family', label: 'Single Family' }, { value: 'condo', label: 'Condo' }, { value: 'townhouse', label: 'Townhouse' }, { value: 'multi_family', label: 'Multi-Family' }, { value: 'manufactured', label: 'Manufactured' }, { value: 'other', label: 'Other' }];
const OPT_PROPERTY_OCC   = [{ value: '', label: '— Not set —' }, { value: 'primary', label: 'Primary Residence' }, { value: 'secondary', label: 'Secondary / Vacation' }, { value: 'investment', label: 'Investment' }];
const OPT_EMPLOYMENT     = [{ value: '', label: '— Not set —' }, { value: 'w2', label: 'W-2 Employee' }, { value: 'self_employed', label: 'Self-Employed' }, { value: 'retired', label: 'Retired' }, { value: '1099', label: '1099 / Contractor' }, { value: 'other', label: 'Other' }];
const OPT_CREDIT         = [{ value: '', label: '— Not set —' }, { value: 'excellent', label: 'Excellent (720+)' }, { value: 'good', label: 'Good (680–719)' }, { value: 'fair', label: 'Fair (620–679)' }, { value: 'poor', label: 'Poor (<620)' }];
const OPT_CURR_OCC       = [{ value: '', label: '— Not set —' }, { value: 'own', label: 'Own' }, { value: 'rent', label: 'Rent' }, { value: 'other', label: 'Other' }];
const OPT_LEAD_SOURCE    = [{ value: '', label: '— Not set —' }, { value: 'instagram', label: 'Instagram' }, { value: 'facebook', label: 'Facebook' }, { value: 'tiktok', label: 'TikTok' }, { value: 'whatsapp', label: 'WhatsApp' }, { value: 'referral', label: 'Referral' }, { value: 'website', label: 'Website' }, { value: 'manual', label: 'Manual' }, { value: 'other', label: 'Other' }];
const OPT_STATUS         = [{ value: 'working', label: 'Working' }, { value: 'qualified', label: 'Qualified' }, { value: 'converted', label: 'Converted' }, { value: 'lost', label: 'Lost' }];

function TriToggle({ value, onChange, name }) {
    return (
        <div className="ldd-tri">
            <button type="button" className={`ldd-tri-btn ${value === true ? 'on' : ''}`} onClick={() => onChange(name, true)}>Yes</button>
            <button type="button" className={`ldd-tri-btn ${value === false ? 'on' : ''}`} onClick={() => onChange(name, false)}>No</button>
            <button type="button" className={`ldd-tri-btn ${(value === null || value === undefined) ? 'on' : ''}`} onClick={() => onChange(name, null)}>—</button>
        </div>
    );
}

function LeadDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({});
    const [noteText, setNoteText] = useState('');
    const [addingNote, setAddingNote] = useState(false);
    const [notes, setNotes] = useState([]);
    const [successMessage, setSuccessMessage] = useState(null);
    const [error, setError] = useState(null);
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [converting, setConverting] = useState(false);
    const [officeUsers, setOfficeUsers] = useState([]);

    const token = localStorage.getItem('token');
    const payload = token ? JSON.parse(atob(token.split('.')[1])) : {};
    const currentUserId = payload.id;
    const currentOfficeId = payload.office_id;
    const isAdmin = payload.role === 'admin';

    const loadLead = async () => {
        try {
            setLoading(true);
            const data = await getLead(id);
            setLead(data);
            setForm(initForm(data));
            setNotes(data.notes || []);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadLead(); }, [id]);

    useEffect(() => {
        if (!currentOfficeId) return;
        getOfficeUsers(currentOfficeId)
            .then(setOfficeUsers)
            .catch(() => {});
    }, [currentOfficeId]);

    useEffect(() => {
        if (successMessage) {
            const t = setTimeout(() => setSuccessMessage(null), 4000);
            return () => clearTimeout(t);
        }
    }, [successMessage]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleBool = (name, value) => setForm(prev => ({ ...prev, [name]: value }));

    const handleSave = async () => {
        setSaving(true);
        setShowSaveModal(false);
        try {
            await updateLead(id, form);
            setSuccessMessage('Changes saved successfully.');
            loadLead();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleConvertToLoan = async () => {
        setConverting(true);
        try {
            await updateLead(id, { ...form, status: 'converted' });
            await createLoan({
                contact_id: lead.contact_id,
                lead_id: parseInt(id),
                office_id: currentOfficeId,
                assigned_to: form.assigned_to || null,
                loan_purpose: form.loan_purpose || null,
                subject_property_tbd: form.subject_property_tbd,
                property_street: form.street_address || null,
                property_unit: form.unit_apt || null,
                property_city: form.city || null,
                property_state: form.state || null,
                property_postal: form.postal_code || null,
                property_county: form.county || null,
                property_type: form.property_type || null,
                property_occupancy: form.property_occupancy || null,
                purchase_price: form.purchase_price || null,
                buying_stage: form.buying_stage || null,
                first_time_home_buyer: form.first_time_home_buyer,
                has_real_estate_agent: form.has_real_estate_agent,
                desired_monthly_payment: form.desired_monthly_payment || null,
                current_interest_rate: form.current_interest_rate || null,
                currently_owning_home: form.currently_owning_home,
                planning_to_sell: form.planning_to_sell,
                gross_annual_income: form.gross_annual_income || null,
                employment_type: form.employment_type || null,
                military_service: form.military_service,
                current_occupancy: form.current_occupancy || null,
                monthly_rent_amount: form.monthly_rent_amount || null,
                lead_provided_by: form.lead_provided_by || null,
                lead_source: form.lead_source || null,
                other_lead_source_description: form.other_lead_source_description || null,
                dnc_request: form.dnc_request ?? false,
                email_opt_out: form.email_opt_out ?? false,
                sms_opt_out: form.sms_opt_out ?? false,
            });
            setShowConvertModal(false);
            navigate('/office/loans');
        } catch (err) {
            setError(err.message);
        } finally {
            setConverting(false);
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!noteText.trim()) return;
        setAddingNote(true);
        try {
            await addLeadNote(id, noteText.trim(), currentUserId);
            setNoteText('');
            loadLead();
        } catch (err) {
            setError(err.message);
        } finally {
            setAddingNote(false);
        }
    };

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
    const fmtDatetime = (d) => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—';

    const teamOpts = [
        { value: '', label: '— Not set —' },
        ...officeUsers
            .filter(u => u.id !== currentUserId)
            .map(u => ({ value: String(u.id), label: `${u.first_name} ${u.last_name}` }))
    ];

    if (loading) {
        return (
            <div className="page-wrapper">
                <Sidebar active="Leads" />
                <div className="page-main">
                    <Topbar />
                    <div className="ldd-center-state">
                        <div className="ldd-spinner"></div>
                        <span>Loading lead...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="page-wrapper">
                <Sidebar active="Leads" />
                <div className="page-main">
                    <Topbar />
                    <div className="ldd-center-state ldd-center-error">{error || 'Lead not found'}</div>
                </div>
            </div>
        );
    }

    return (
        <>
        <div className="page-wrapper">
            <Sidebar active="Leads" />
            <div className="page-main">
                <Topbar />
                <div className="page-content">

                    <div className="page-header">
                        <div className="page-header-left">
                            <button className="ldd-back" onClick={() => navigate('/office/leads')}>
                                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
                                </svg>
                                Leads
                            </button>
                            <h1 className="page-title">{lead.contact_first_name} {lead.contact_last_name}</h1>
                            <span className={`ldd-status-chip ldd-st-${form.status}`}>{form.status}</span>
                        </div>
                        <div className="page-header-right">
                            {form.status !== 'converted' && (
                                <button className="btn-secondary" onClick={() => setShowConvertModal(true)}>
                                    Convert to Loan
                                </button>
                            )}
                            <button className="btn-primary" onClick={() => setShowSaveModal(true)} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>

                    <div className="ldd-layout">

                        {/* ── Left sidebar ── */}
                        <div className="ldd-sidebar">

                            <div className="ldd-card">
                                <div className="ldd-card-hd">Contact</div>
                                <div className="ldd-contact-av">
                                    {lead.contact_first_name?.[0]}{lead.contact_last_name?.[0]}
                                </div>
                                <div className="ldd-contact-name">{lead.contact_first_name} {lead.contact_last_name}</div>
                                {lead.contact_email && (
                                    <div className="ldd-contact-row">
                                        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                                        </svg>
                                        {lead.contact_email}
                                    </div>
                                )}
                                {lead.contact_phone && (
                                    <div className="ldd-contact-row">
                                        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                                        </svg>
                                        {lead.contact_phone}
                                    </div>
                                )}
                                <div className="ldd-contact-row">
                                    <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd"/>
                                    </svg>
                                    <span className={`ldd-src-badge ldd-src-${lead.contact_source}`}>{lead.contact_source}</span>
                                </div>
                            </div>

                            <div className="ldd-card">
                                <div className="ldd-card-hd">Status</div>
                                <CustomSelect
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    options={OPT_STATUS}
                                />
                                {form.status === 'lost' && (
                                    <div className="ldd-field" style={{ marginTop: 10 }}>
                                        <label>Lost Reason</label>
                                        <input
                                            type="text"
                                            name="lost_reason"
                                            value={form.lost_reason}
                                            onChange={handleChange}
                                            placeholder="Why was this lead lost?"
                                        />
                                    </div>
                                )}
                                <div className="ldd-meta">
                                    <div className="ldd-meta-row">
                                        <span className="ldd-meta-k">Created</span>
                                        <span className="ldd-meta-v">{fmtDate(lead.created_at)}</span>
                                    </div>
                                    {lead.closed_at && (
                                        <div className="ldd-meta-row">
                                            <span className="ldd-meta-k">Closed</span>
                                            <span className="ldd-meta-v">{fmtDate(lead.closed_at)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="ldd-card">
                                <div className="ldd-card-hd">Compliance</div>
                                <label className={`ldd-chk ${form.dnc_request ? 'ldd-chk-danger' : ''}`}>
                                    <input type="checkbox" checked={!!form.dnc_request} onChange={(e) => handleBool('dnc_request', e.target.checked)} />
                                    <span>DNC Request</span>
                                </label>
                                <label className="ldd-chk">
                                    <input type="checkbox" checked={!!form.email_opt_out} onChange={(e) => handleBool('email_opt_out', e.target.checked)} />
                                    <span>Email Opt-Out</span>
                                </label>
                                <label className="ldd-chk">
                                    <input type="checkbox" checked={!!form.sms_opt_out} onChange={(e) => handleBool('sms_opt_out', e.target.checked)} />
                                    <span>SMS Opt-Out</span>
                                </label>
                            </div>

                            <div className="ldd-card">
                                <div className="ldd-card-hd">Team Assignment</div>
                                <div className="ldd-field">
                                    <label>Loan Officer Assigned</label>
                                    <div className="ldd-readonly">{lead.assigned_first_name ? `${lead.assigned_first_name} ${lead.assigned_last_name}` : '— Not assigned —'}</div>
                                    <div className="ldd-readonly-hint">Manage assignment from the contact profile</div>
                                </div>
                                <div className="ldd-field" style={{ marginTop: 10 }}>
                                    <label>Realtor Assigned</label>
                                    <div className="ldd-readonly">{lead.realtor_first_name ? `${lead.realtor_first_name} ${lead.realtor_last_name}` : '— Not assigned —'}</div>
                                    <div className="ldd-readonly-hint">Manage assignment from the contact profile</div>
                                </div>
                            </div>
                        </div>

                        {/* ── Main form ── */}
                        <div className="ldd-main">

                            {/* Loan Intent */}
                            <div className="ldd-section">
                                <div className="ldd-section-hd">Loan Intent</div>
                                <div className="ldd-g2">
                                    <div className="ldd-field">
                                        <label>Loan Purpose</label>
                                        <CustomSelect name="loan_purpose" value={form.loan_purpose} onChange={handleChange} options={OPT_LOAN_PURPOSE} />
                                    </div>
                                    <div className="ldd-field">
                                        <label>Buying Stage</label>
                                        <CustomSelect name="buying_stage" value={form.buying_stage} onChange={handleChange} options={OPT_BUYING_STAGE} />
                                    </div>
                                </div>
                                <div className="ldd-g2">
                                    <div className="ldd-field">
                                        <label>First Time Home Buyer</label>
                                        <TriToggle value={form.first_time_home_buyer} onChange={handleBool} name="first_time_home_buyer" />
                                    </div>
                                    <div className="ldd-field">
                                        <label>Has Real Estate Agent</label>
                                        <TriToggle value={form.has_real_estate_agent} onChange={handleBool} name="has_real_estate_agent" />
                                    </div>
                                </div>
                                <div className="ldd-field ldd-field-sm">
                                    <label>Desired Monthly Payment</label>
                                    <div className="ldd-pfx">
                                        <span>$</span>
                                        <input type="number" name="desired_monthly_payment" value={form.desired_monthly_payment} onChange={handleChange} placeholder="0" min="0" />
                                    </div>
                                </div>
                            </div>

                            {/* Property */}
                            <div className="ldd-section">
                                <div className="ldd-section-hd">Property</div>
                                <div className="ldd-g2">
                                    <div className="ldd-field">
                                        <label>Property Type</label>
                                        <CustomSelect name="property_type" value={form.property_type} onChange={handleChange} options={OPT_PROPERTY_TYPE} />
                                    </div>
                                    <div className="ldd-field">
                                        <label>Property Occupancy</label>
                                        <CustomSelect name="property_occupancy" value={form.property_occupancy} onChange={handleChange} options={OPT_PROPERTY_OCC} />
                                    </div>
                                </div>
                                <div className="ldd-field">
                                    <label>Subject Property TBD</label>
                                    <TriToggle value={form.subject_property_tbd} onChange={handleBool} name="subject_property_tbd" />
                                </div>
                                {!form.subject_property_tbd && (
                                    <>
                                        <div className="ldd-field">
                                            <label>Street Address</label>
                                            <input type="text" name="street_address" value={form.street_address} onChange={handleChange} placeholder="123 Main St" />
                                        </div>
                                        <div className="ldd-g2">
                                            <div className="ldd-field">
                                                <label>Unit / Apt</label>
                                                <input type="text" name="unit_apt" value={form.unit_apt} onChange={handleChange} placeholder="Apt 2B" />
                                            </div>
                                            <div className="ldd-field">
                                                <label>County</label>
                                                <input type="text" name="county" value={form.county} onChange={handleChange} placeholder="Miami-Dade" />
                                            </div>
                                        </div>
                                        <div className="ldd-g3">
                                            <div className="ldd-field">
                                                <label>City</label>
                                                <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="Miami" />
                                            </div>
                                            <div className="ldd-field">
                                                <label>State</label>
                                                <input type="text" name="state" value={form.state} onChange={handleChange} placeholder="FL" />
                                            </div>
                                            <div className="ldd-field">
                                                <label>Postal Code</label>
                                                <input type="text" name="postal_code" value={form.postal_code} onChange={handleChange} placeholder="33101" />
                                            </div>
                                        </div>
                                    </>
                                )}
                                <div className="ldd-field ldd-field-sm">
                                    <label>Estimated Purchase Price</label>
                                    <div className="ldd-pfx">
                                        <span>$</span>
                                        <input type="number" name="purchase_price" value={form.purchase_price} onChange={handleChange} placeholder="0" min="0" />
                                    </div>
                                </div>

                                {form.loan_purpose === 'refinance' && (
                                    <div className="ldd-subsection">
                                        <div className="ldd-subsection-hd">Refinance Details</div>
                                        <div className="ldd-g2">
                                            <div className="ldd-field">
                                                <label>Current Interest Rate</label>
                                                <div className="ldd-sfx">
                                                    <input type="number" name="current_interest_rate" value={form.current_interest_rate} onChange={handleChange} placeholder="6.5" step="0.01" min="0" />
                                                    <span>%</span>
                                                </div>
                                            </div>
                                            <div className="ldd-field">
                                                <label>Currently Owning Home</label>
                                                <TriToggle value={form.currently_owning_home} onChange={handleBool} name="currently_owning_home" />
                                            </div>
                                        </div>
                                        <div className="ldd-field">
                                            <label>Planning to Sell</label>
                                            <TriToggle value={form.planning_to_sell} onChange={handleBool} name="planning_to_sell" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Financial */}
                            <div className="ldd-section">
                                <div className="ldd-section-hd">Financial Situation</div>
                                <div className="ldd-g2">
                                    <div className="ldd-field">
                                        <label>Gross Annual Income (Est.)</label>
                                        <div className="ldd-pfx">
                                            <span>$</span>
                                            <input type="number" name="gross_annual_income" value={form.gross_annual_income} onChange={handleChange} placeholder="0" min="0" />
                                        </div>
                                    </div>
                                    <div className="ldd-field">
                                        <label>Employment Type</label>
                                        <CustomSelect name="employment_type" value={form.employment_type} onChange={handleChange} options={OPT_EMPLOYMENT} />
                                    </div>
                                </div>
                                <div className="ldd-g2">
                                    <div className="ldd-field">
                                        <label>Credit Score Range</label>
                                        <CustomSelect name="credit_score_range" value={form.credit_score_range} onChange={handleChange} options={OPT_CREDIT} />
                                    </div>
                                    <div className="ldd-field">
                                        <label>Military Service</label>
                                        <TriToggle value={form.military_service} onChange={handleBool} name="military_service" />
                                    </div>
                                </div>
                                <div className="ldd-g2">
                                    <div className="ldd-field">
                                        <label>Current Occupancy</label>
                                        <CustomSelect name="current_occupancy" value={form.current_occupancy} onChange={handleChange} options={OPT_CURR_OCC} />
                                    </div>
                                    {form.current_occupancy === 'rent' && (
                                        <div className="ldd-field">
                                            <label>Monthly Rent Amount</label>
                                            <div className="ldd-pfx">
                                                <span>$</span>
                                                <input type="number" name="monthly_rent_amount" value={form.monthly_rent_amount} onChange={handleChange} placeholder="0" min="0" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Lead Origin */}
                            <div className="ldd-section">
                                <div className="ldd-section-hd">Lead Origin</div>
                                <div className="ldd-g2">
                                    <div className="ldd-field">
                                        <label>Lead Source</label>
                                        <CustomSelect name="lead_source" value={form.lead_source} onChange={handleChange} options={OPT_LEAD_SOURCE} />
                                    </div>
                                    <div className="ldd-field">
                                        <label>Lead Provided By</label>
                                        <input type="text" name="lead_provided_by" value={form.lead_provided_by} onChange={handleChange} placeholder="Name or company" />
                                    </div>
                                </div>
                                {form.lead_source === 'other' && (
                                    <div className="ldd-field">
                                        <label>Other Source Description</label>
                                        <input type="text" name="other_lead_source_description" value={form.other_lead_source_description} onChange={handleChange} placeholder="Describe the source" />
                                    </div>
                                )}
                            </div>

                            {/* Notes */}
                            <div className="ldd-section">
                                <div className="ldd-section-hd">Notes</div>
                                <form onSubmit={handleAddNote} className="ldd-note-form">
                                    <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add a note..." rows={3} />
                                    <button type="submit" className="btn-primary" disabled={!noteText.trim() || addingNote}>
                                        {addingNote ? 'Adding...' : 'Add Note'}
                                    </button>
                                </form>
                                {notes.length > 0 ? (
                                    <div className="ldd-notes">
                                        {notes.map(note => (
                                            <div key={note.id} className="ldd-note">
                                                <div className="ldd-note-hd">
                                                    <span className="ldd-note-author">{note.first_name} {note.last_name}</span>
                                                    <span className="ldd-note-date">{fmtDatetime(note.created_at)}</span>
                                                </div>
                                                <div className="ldd-note-body">{note.text}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="ldd-notes-empty">No notes yet</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

            {/* Save confirmation modal */}
            {showSaveModal && (
                <div className="ldd-modal-overlay" onClick={() => setShowSaveModal(false)}>
                    <div className="ldd-confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ldd-confirm-icon ldd-confirm-icon-save">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                                <polyline points="17 21 17 13 7 13 7 21"/>
                                <polyline points="7 3 7 8 15 8"/>
                            </svg>
                        </div>
                        <h2 className="ldd-confirm-title">Save changes?</h2>
                        <p className="ldd-confirm-text">
                            All changes to <strong>{lead.contact_first_name} {lead.contact_last_name}</strong>'s lead will be saved.
                        </p>
                        <div className="ldd-confirm-actions">
                            <button className="btn-secondary" onClick={() => setShowSaveModal(false)}>Cancel</button>
                            <button className="ldd-confirm-save-btn" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : 'Yes, save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Convert to Loan modal */}
            {showConvertModal && (
                <div className="ldd-modal-overlay" onClick={() => setShowConvertModal(false)}>
                    <div className="ldd-confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ldd-confirm-icon ldd-confirm-icon-accent">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                                <line x1="1" y1="10" x2="23" y2="10"/>
                            </svg>
                        </div>
                        <h2 className="ldd-confirm-title">Convert to Loan</h2>
                        <p className="ldd-confirm-text">
                            You are about to convert <strong>{lead.contact_first_name} {lead.contact_last_name}</strong>'s lead into an active loan. The lead status will be marked as <strong>Converted</strong>.
                        </p>
                        <div className="ldd-confirm-actions">
                            <button className="btn-secondary" onClick={() => setShowConvertModal(false)}>Cancel</button>
                            <button className="ldd-confirm-convert-btn" onClick={handleConvertToLoan} disabled={converting}>
                                {converting ? 'Converting...' : 'Yes, create Loan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {successMessage && (
                <div className="ldd-toast">
                    <div className="ldd-toast-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </div>
                    <div className="ldd-toast-text">{successMessage}</div>
                    <button className="ldd-toast-close" onClick={() => setSuccessMessage(null)}>×</button>
                </div>
            )}
        </>
    );
}

export default LeadDetail;
