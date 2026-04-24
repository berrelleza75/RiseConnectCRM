import React, { useState } from 'react';
import './Prospects.css';
import Sidebar from '../../components/Sidebar/Sidebar';

const SOURCES = [
  { key: 'all', label: 'All', icon: null },
  { key: 'instagram', label: 'Instagram', icon: <InstagramIcon /> },
  { key: 'facebook', label: 'Facebook', icon: <FacebookIcon /> },
  { key: 'tiktok', label: 'TikTok', icon: <TikTokIcon /> },
  { key: 'other', label: 'Other', icon: <OtherIcon /> },
];

const STATUS_COLORS = {
  new: { bg: 'rgba(201,168,76,0.1)', color: '#c9a84c', label: 'New' },
  contacted: { bg: 'rgba(12,68,124,0.1)', color: '#0c447c', label: 'Contacted' },
  qualified: { bg: 'rgba(39,80,10,0.1)', color: '#27500a', label: 'Qualified' },
};

const emptyForm = {
  firstName: '', lastName: '', email: '', cellPhone: '',
  ssn: '', dob: '', militaryService: false,
  currentAddress: '', addressMonths: '', addressYears: '',
  hasCoBorrower: false,
  coBorrowerFirstName: '', coBorrowerLastName: '', coBorrowerEmail: '',
  coBorrowerPhone: '', coBorrowerSSN: '', coBorrowerDOB: '', coBorrowerMilitary: false,
  appraisedValue: '', baseLoanAmount: '', mortgageType: '', lienPosition: '',
  noteRate: '', qualifyingRate: '', amortizationTerm: '', estimatedHOI: '',
  estimatedPropertyTaxes: '', estimatedHOA: '', interestOnly: false,
  interestOnlyTermMonths: '', impoundWaiver: false, loanFico: '',
  grossAnnualIncome: '', employmentType: '', totalMonthlyLiability: '',
  buyingStage: '', desiredMonthlyPayment: '', firstTimeHomeBuyer: false,
  hasRealEstateAgent: false, occupancy: '', monthlyRentAmount: '',
  loanPurpose: '', purchasePrice: '', refinanceType: '', cashOutPurpose: '',
  currentInterestRate: '', adjustableRate: false, initialAdjustmentPeriod: '',
  subsequentAdjustmentPeriod: '', currentlyOwningHome: false, planningToSell: false,
  bankruptcyLast7: false, yearsSinceBankruptcy: '', foreclosureLast7: false,
  yearsSinceForeclosure: '', subjectPropertyTBD: false, streetAddress: '', city: '',
  county: '', postalCode: '', state: '', unitApt: '', propertyType: '',
  source: 'instagram', leadProvidedBy: '', leadSource: '', otherLeadSource: '',
  primaryLeadOwner: '', dncRequest: false, emailOptOut: false, smsOptOut: false,
};

function Prospects() {
  const [activeSource, setActiveSource] = useState('all');
  const [prospects, setProspects] = useState([]);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [activeSection, setActiveSection] = useState('borrower');
  const [noteInput, setNoteInput] = useState('');

  const filtered = activeSource === 'all'
    ? prospects
    : prospects.filter(p => p.source === activeSource);

  const handleAddProspect = () => {
    setForm({ ...emptyForm, source: activeSource === 'all' ? 'instagram' : activeSource });
    setShowAddModal(true);
  };

  const handleSaveProspect = () => {
    const newP = {
      id: Date.now(),
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      phone: form.cellPhone,
      source: form.source,
      status: 'new',
      created_at: new Date().toISOString(),
    };
    setProspects(prev => [newP, ...prev]);
    setShowAddModal(false);
  };

  const handleSelectProspect = (p) => {
    setSelectedProspect({ ...p, _notes: p._notes || [] });
    setForm({
      ...emptyForm,
      firstName: p.first_name || '',
      lastName: p.last_name || '',
      email: p.email || '',
      cellPhone: p.phone || '',
      source: p.source || 'instagram',
    });
    setActiveSection('borrower');
  };

  const handleSaveChanges = () => {
    setProspects(prev => prev.map(p =>
      p.id === selectedProspect.id
        ? { ...p, first_name: form.firstName, last_name: form.lastName, email: form.email, phone: form.cellPhone }
        : p
    ));
    setSelectedProspect(prev => ({ ...prev, first_name: form.firstName, last_name: form.lastName }));
  };

  const handleAddNote = (text) => {
    const note = { id: Date.now(), text, created_at: new Date().toISOString() };
    setSelectedProspect(prev => ({ ...prev, _notes: [note, ...(prev._notes || [])] }));
    setProspects(prev => prev.map(p =>
      p.id === selectedProspect.id
        ? { ...p, _notes: [note, ...(p._notes || [])] }
        : p
    ));
  };

  const handleCloseDrawer = () => setSelectedProspect(null);

  return (
    <div className="dashboard-wrapper">
      <Sidebar active="Prospects" />
      <div className="dashboard-main">
        <div className="prospects-wrapper">
          <div className="prospects-list-panel">
            <div className="pr-header">
              <div>
                <h1 className="pr-title">Prospects</h1>
                <p className="pr-subtitle">{filtered.length} total</p>
              </div>
              <button className="pr-add-btn" onClick={handleAddProspect}>+ New Prospect</button>
            </div>
            <div className="pr-tabs">
              {SOURCES.map(s => (
                <button key={s.key} className={`pr-tab ${activeSource === s.key ? 'active' : ''}`} onClick={() => setActiveSource(s.key)}>
                  {s.icon && <span className="pr-tab-icon">{s.icon}</span>}
                  {s.label}
                </button>
              ))}
            </div>
            <div className="pr-table-wrap">
              {filtered.length === 0 ? (
                <div className="pr-empty">
                  <div className="pr-empty-icon">👤</div>
                  <p>No prospects yet</p>
                  <span>Add your first prospect from this source</span>
                </div>
              ) : (
                <table className="pr-table">
                  <thead>
                    <tr><th>Prospect</th><th>Source</th><th>Status</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => (
                      <tr key={p.id} className={selectedProspect?.id === p.id ? 'selected' : ''} onClick={() => handleSelectProspect(p)}>
                        <td>
                          <div className="pr-prospect-cell">
                            <div className="pr-avatar">{p.first_name[0]}{p.last_name[0]}</div>
                            <div>
                              <div className="pr-name">{p.first_name} {p.last_name}</div>
                              <div className="pr-email">{p.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="pr-source-badge">
                            {SOURCES.find(s => s.key === p.source)?.icon}
                            <span>{SOURCES.find(s => s.key === p.source)?.label}</span>
                          </div>
                        </td>
                        <td>
                          <span className="pr-status" style={{ background: STATUS_COLORS[p.status]?.bg, color: STATUS_COLORS[p.status]?.color }}>
                            {STATUS_COLORS[p.status]?.label}
                          </span>
                        </td>
                        <td className="pr-date">{new Date(p.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {selectedProspect && (
            <>
              <div className="prospects-drawer-backdrop" onClick={handleCloseDrawer} />
              <div className="prospects-detail-panel">
                <div className="pd-header">
                  <div className="pd-header-left">
                    <div className="pd-avatar-lg">{selectedProspect.first_name[0]}{selectedProspect.last_name[0]}</div>
                    <div>
                      <h2 className="pd-name">{selectedProspect.first_name} {selectedProspect.last_name}</h2>
                      <div className="pd-meta">
                        <span className="pr-status" style={{ background: STATUS_COLORS[selectedProspect.status]?.bg, color: STATUS_COLORS[selectedProspect.status]?.color }}>
                          {STATUS_COLORS[selectedProspect.status]?.label}
                        </span>
                        <span className="pd-source">
                          {SOURCES.find(s => s.key === selectedProspect.source)?.icon}
                          {SOURCES.find(s => s.key === selectedProspect.source)?.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="pd-header-actions">
                    <button className="pd-convert-btn">Convert to Loan</button>
                    <button className="pd-close-btn" onClick={handleCloseDrawer}>✕</button>
                  </div>
                </div>
                <div className="pd-sections">
                  {['borrower', 'mortgage', 'property', 'other', 'notes'].map(s => (
                    <button key={s} className={`pd-section-tab ${activeSection === s ? 'active' : ''}`} onClick={() => setActiveSection(s)}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="pd-form-scroll">
                  {activeSection === 'borrower' && <BorrowerSection form={form} setForm={setForm} />}
                  {activeSection === 'mortgage' && <MortgageSection form={form} setForm={setForm} />}
                  {activeSection === 'property' && <PropertySection form={form} setForm={setForm} />}
                  {activeSection === 'other' && <OtherSection form={form} setForm={setForm} />}
                  {activeSection === 'notes' && (
                    <NotesSection notes={selectedProspect._notes || []} noteInput={noteInput} setNoteInput={setNoteInput} onAddNote={handleAddNote} />
                  )}
                </div>
                <div className="pd-footer">
                  <button className="pd-save-btn" onClick={handleSaveChanges}>Save Changes</button>
                </div>
              </div>
            </>
          )}

          {showAddModal && (
            <div className="pr-modal-overlay" onClick={() => setShowAddModal(false)}>
              <div className="pr-modal" onClick={e => e.stopPropagation()}>
                <div className="pr-modal-header">
                  <h3>New Prospect</h3>
                  <button onClick={() => setShowAddModal(false)}>✕</button>
                </div>
                <div className="pr-modal-body">
                  <div className="pr-form-row">
                    <div className="pr-field">
                      <label>First Name</label>
                      <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="First name" />
                    </div>
                    <div className="pr-field">
                      <label>Last Name</label>
                      <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Last name" />
                    </div>
                  </div>
                  <div className="pr-form-row">
                    <div className="pr-field">
                      <label>Email</label>
                      <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" />
                    </div>
                    <div className="pr-field">
                      <label>Cell Phone</label>
                      <input value={form.cellPhone} onChange={e => setForm(f => ({ ...f, cellPhone: e.target.value }))} placeholder="555-0000" />
                    </div>
                  </div>
                  <div className="pr-field">
                    <label>Source</label>
                    <div className="pr-source-select">
                      {SOURCES.filter(s => s.key !== 'all').map(s => (
                        <button key={s.key} className={`pr-source-opt ${form.source === s.key ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, source: s.key }))}>
                          {s.icon}{s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="pr-modal-footer">
                  <button className="pr-cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button className="pr-save-btn" onClick={handleSaveProspect}>Add Prospect</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="pr-field">
      <label>{label}</label>
      {children}
    </div>
  );
}

function BorrowerSection({ form, setForm }) {
  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="pd-section-content">
      <div className="pd-section-title">Borrower Information</div>
      <div className="pr-form-row">
        <Field label="First Name"><input value={form.firstName} onChange={e => u('firstName', e.target.value)} placeholder="First name" /></Field>
        <Field label="Last Name"><input value={form.lastName} onChange={e => u('lastName', e.target.value)} placeholder="Last name" /></Field>
      </div>
      <div className="pr-form-row">
        <Field label="Email"><input value={form.email} onChange={e => u('email', e.target.value)} placeholder="email@example.com" /></Field>
        <Field label="Cell Phone"><input value={form.cellPhone} onChange={e => u('cellPhone', e.target.value)} placeholder="555-0000" /></Field>
      </div>
      <div className="pr-form-row">
        <Field label="SSN"><input value={form.ssn} onChange={e => u('ssn', e.target.value)} placeholder="XXX-XX-XXXX" /></Field>
        <Field label="Date of Birth"><input type="date" value={form.dob} onChange={e => u('dob', e.target.value)} /></Field>
      </div>
      <Field label="Current Address"><input value={form.currentAddress} onChange={e => u('currentAddress', e.target.value)} placeholder="Full address" /></Field>
      <div className="pr-form-row">
        <Field label="Address Duration (Months)"><input type="number" value={form.addressMonths} onChange={e => u('addressMonths', e.target.value)} placeholder="0" /></Field>
        <Field label="Address Duration (Years)"><input type="number" value={form.addressYears} onChange={e => u('addressYears', e.target.value)} placeholder="0" /></Field>
      </div>
      <div className="pr-toggle-row">
        <label className="pr-toggle-label"><input type="checkbox" checked={form.militaryService} onChange={e => u('militaryService', e.target.checked)} /> Military Service</label>
      </div>
      <div className="pd-section-title" style={{ marginTop: 24 }}>Occupancy</div>
      <Field label="Occupancy Type">
        <select value={form.occupancy} onChange={e => u('occupancy', e.target.value)}>
          <option value="">Select...</option>
          <option>Primary Residence</option>
          <option>Secondary Residence</option>
          <option>Investment Property</option>
          <option>rent</option>
        </select>
      </Field>
      {form.occupancy === 'rent' && (
        <Field label="Monthly Rent Amount"><input type="number" value={form.monthlyRentAmount} onChange={e => u('monthlyRentAmount', e.target.value)} placeholder="$0" /></Field>
      )}
      <div className="pd-section-title" style={{ marginTop: 24 }}>Co-Borrower</div>
      <div className="pr-toggle-row">
        <label className="pr-toggle-label"><input type="checkbox" checked={form.hasCoBorrower} onChange={e => u('hasCoBorrower', e.target.checked)} /> Has Co-Borrower</label>
      </div>
      {form.hasCoBorrower && (
        <>
          <div className="pr-form-row">
            <Field label="Co-Borrower First Name"><input value={form.coBorrowerFirstName} onChange={e => u('coBorrowerFirstName', e.target.value)} /></Field>
            <Field label="Co-Borrower Last Name"><input value={form.coBorrowerLastName} onChange={e => u('coBorrowerLastName', e.target.value)} /></Field>
          </div>
          <div className="pr-form-row">
            <Field label="Co-Borrower Email"><input value={form.coBorrowerEmail} onChange={e => u('coBorrowerEmail', e.target.value)} /></Field>
            <Field label="Co-Borrower Phone"><input value={form.coBorrowerPhone} onChange={e => u('coBorrowerPhone', e.target.value)} /></Field>
          </div>
          <div className="pr-form-row">
            <Field label="Co-Borrower SSN"><input value={form.coBorrowerSSN} onChange={e => u('coBorrowerSSN', e.target.value)} /></Field>
            <Field label="Co-Borrower DOB"><input type="date" value={form.coBorrowerDOB} onChange={e => u('coBorrowerDOB', e.target.value)} /></Field>
          </div>
          <div className="pr-toggle-row">
            <label className="pr-toggle-label"><input type="checkbox" checked={form.coBorrowerMilitary} onChange={e => u('coBorrowerMilitary', e.target.checked)} /> Co-Borrower Military Service</label>
          </div>
        </>
      )}
    </div>
  );
}

function MortgageSection({ form, setForm }) {
  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="pd-section-content">
      <div className="pd-section-title">Mortgage Information</div>
      <div className="pr-form-row">
        <Field label="Appraised Value"><input type="number" value={form.appraisedValue} onChange={e => u('appraisedValue', e.target.value)} placeholder="$0" /></Field>
        <Field label="Base Loan Amount"><input type="number" value={form.baseLoanAmount} onChange={e => u('baseLoanAmount', e.target.value)} placeholder="$0" /></Field>
      </div>
      <div className="pr-form-row">
        <Field label="Mortgage Type">
          <select value={form.mortgageType} onChange={e => u('mortgageType', e.target.value)}>
            <option value="">Select...</option>
            <option>Conventional</option><option>FHA</option><option>VA</option><option>USDA</option><option>Jumbo</option>
          </select>
        </Field>
        <Field label="Lien Position">
          <select value={form.lienPosition} onChange={e => u('lienPosition', e.target.value)}>
            <option value="">Select...</option>
            <option>First</option><option>Second</option>
          </select>
        </Field>
      </div>
      <div className="pr-form-row">
        <Field label="Note Rate"><input type="number" value={form.noteRate} onChange={e => u('noteRate', e.target.value)} placeholder="%" /></Field>
        <Field label="Qualifying Rate"><input type="number" value={form.qualifyingRate} onChange={e => u('qualifyingRate', e.target.value)} placeholder="%" /></Field>
      </div>
      <div className="pr-form-row">
        <Field label="Amortization Term"><input type="number" value={form.amortizationTerm} onChange={e => u('amortizationTerm', e.target.value)} placeholder="months" /></Field>
        <Field label="Loan FICO"><input type="number" value={form.loanFico} onChange={e => u('loanFico', e.target.value)} placeholder="000" /></Field>
      </div>
      <div className="pr-form-row">
        <Field label="Est. Monthly HOI"><input type="number" value={form.estimatedHOI} onChange={e => u('estimatedHOI', e.target.value)} placeholder="$0" /></Field>
        <Field label="Est. Property Taxes"><input type="number" value={form.estimatedPropertyTaxes} onChange={e => u('estimatedPropertyTaxes', e.target.value)} placeholder="$0" /></Field>
      </div>
      <div className="pr-form-row">
        <Field label="Est. HOA Dues"><input type="number" value={form.estimatedHOA} onChange={e => u('estimatedHOA', e.target.value)} placeholder="$0" /></Field>
        <Field label="Gross Annual Income"><input type="number" value={form.grossAnnualIncome} onChange={e => u('grossAnnualIncome', e.target.value)} placeholder="$0" /></Field>
      </div>
      <div className="pr-form-row">
        <Field label="Employment Type">
          <select value={form.employmentType} onChange={e => u('employmentType', e.target.value)}>
            <option value="">Select...</option>
            <option>W-2</option><option>Self-Employed</option><option>1099</option><option>Retired</option>
          </select>
        </Field>
        <Field label="Total Monthly Liability"><input type="number" value={form.totalMonthlyLiability} onChange={e => u('totalMonthlyLiability', e.target.value)} placeholder="$0" /></Field>
      </div>
      <div className="pr-form-row">
        <Field label="Buying Stage">
          <select value={form.buyingStage} onChange={e => u('buyingStage', e.target.value)}>
            <option value="">Select...</option>
            <option>Just Looking</option><option>Ready to Buy</option><option>Under Contract</option>
          </select>
        </Field>
        <Field label="Desired Monthly Payment"><input type="number" value={form.desiredMonthlyPayment} onChange={e => u('desiredMonthlyPayment', e.target.value)} placeholder="$0" /></Field>
      </div>
      <div className="pr-toggle-row">
        <label className="pr-toggle-label"><input type="checkbox" checked={form.firstTimeHomeBuyer} onChange={e => u('firstTimeHomeBuyer', e.target.checked)} /> First Time Homebuyer</label>
        <label className="pr-toggle-label"><input type="checkbox" checked={form.hasRealEstateAgent} onChange={e => u('hasRealEstateAgent', e.target.checked)} /> Has Real Estate Agent</label>
        <label className="pr-toggle-label"><input type="checkbox" checked={form.interestOnly} onChange={e => u('interestOnly', e.target.checked)} /> Interest Only</label>
        <label className="pr-toggle-label"><input type="checkbox" checked={form.impoundWaiver} onChange={e => u('impoundWaiver', e.target.checked)} /> Impound Waiver</label>
      </div>
      {form.interestOnly && (
        <Field label="Interest Only Term (Months)"><input type="number" value={form.interestOnlyTermMonths} onChange={e => u('interestOnlyTermMonths', e.target.value)} /></Field>
      )}
      <div className="pd-section-title" style={{ marginTop: 24 }}>Loan Purpose</div>
      <div className="pr-radio-group">
        {['Purchase', 'Refinance'].map(v => (
          <label key={v} className={`pr-radio-opt ${form.loanPurpose === v ? 'active' : ''}`}>
            <input type="radio" name="loanPurpose" value={v} checked={form.loanPurpose === v} onChange={e => u('loanPurpose', e.target.value)} />
            {v}
          </label>
        ))}
      </div>
      {form.loanPurpose === 'Purchase' && (
        <Field label="Purchase Price"><input type="number" value={form.purchasePrice} onChange={e => u('purchasePrice', e.target.value)} placeholder="$0" /></Field>
      )}
      {form.loanPurpose === 'Refinance' && (
        <>
          <div className="pr-form-row">
            <Field label="Refinance Type">
              <select value={form.refinanceType} onChange={e => u('refinanceType', e.target.value)}>
                <option value="">Select...</option>
                <option>Rate & Term</option><option>Cash Out</option>
              </select>
            </Field>
            <Field label="Current Interest Rate"><input type="number" value={form.currentInterestRate} onChange={e => u('currentInterestRate', e.target.value)} placeholder="%" /></Field>
          </div>
          {form.refinanceType === 'Cash Out' && (
            <Field label="Cash-Out Purpose"><input value={form.cashOutPurpose} onChange={e => u('cashOutPurpose', e.target.value)} placeholder="Purpose..." /></Field>
          )}
        </>
      )}
      <div className="pd-section-title" style={{ marginTop: 24 }}>Additional</div>
      <div className="pr-toggle-row">
        <label className="pr-toggle-label"><input type="checkbox" checked={form.adjustableRate} onChange={e => u('adjustableRate', e.target.checked)} /> Adjustable Rate</label>
        <label className="pr-toggle-label"><input type="checkbox" checked={form.currentlyOwningHome} onChange={e => u('currentlyOwningHome', e.target.checked)} /> Currently Owning a Home</label>
        <label className="pr-toggle-label"><input type="checkbox" checked={form.bankruptcyLast7} onChange={e => u('bankruptcyLast7', e.target.checked)} /> Bankruptcy in Last 7 Years</label>
        <label className="pr-toggle-label"><input type="checkbox" checked={form.foreclosureLast7} onChange={e => u('foreclosureLast7', e.target.checked)} /> Foreclosure in Last 7 Years</label>
      </div>
      {form.adjustableRate && (
        <div className="pr-form-row">
          <Field label="Initial Adjustment Period"><input value={form.initialAdjustmentPeriod} onChange={e => u('initialAdjustmentPeriod', e.target.value)} /></Field>
          <Field label="Subsequent Adjustment Period"><input value={form.subsequentAdjustmentPeriod} onChange={e => u('subsequentAdjustmentPeriod', e.target.value)} /></Field>
        </div>
      )}
      {form.currentlyOwningHome && (
        <div className="pr-toggle-row">
          <label className="pr-toggle-label"><input type="checkbox" checked={form.planningToSell} onChange={e => u('planningToSell', e.target.checked)} /> Planning to Sell Before Buying</label>
        </div>
      )}
      {form.bankruptcyLast7 && (
        <Field label="Years Since Bankruptcy"><input type="number" value={form.yearsSinceBankruptcy} onChange={e => u('yearsSinceBankruptcy', e.target.value)} /></Field>
      )}
      {form.foreclosureLast7 && (
        <Field label="Years Since Foreclosure"><input type="number" value={form.yearsSinceForeclosure} onChange={e => u('yearsSinceForeclosure', e.target.value)} /></Field>
      )}
    </div>
  );
}

function PropertySection({ form, setForm }) {
  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="pd-section-content">
      <div className="pd-section-title">Property Information</div>
      <div className="pr-toggle-row">
        <label className="pr-toggle-label"><input type="checkbox" checked={form.subjectPropertyTBD} onChange={e => u('subjectPropertyTBD', e.target.checked)} /> Subject Property TBD</label>
      </div>
      {!form.subjectPropertyTBD && (
        <>
          <Field label="Street Address"><input value={form.streetAddress} onChange={e => u('streetAddress', e.target.value)} placeholder="123 Main St" /></Field>
          <div className="pr-form-row">
            <Field label="City"><input value={form.city} onChange={e => u('city', e.target.value)} /></Field>
            <Field label="County"><input value={form.county} onChange={e => u('county', e.target.value)} /></Field>
          </div>
          <div className="pr-form-row">
            <Field label="Postal Code"><input value={form.postalCode} onChange={e => u('postalCode', e.target.value)} /></Field>
            <Field label="State"><input value={form.state} onChange={e => u('state', e.target.value)} /></Field>
          </div>
          <div className="pr-form-row">
            <Field label="Unit / Apt"><input value={form.unitApt} onChange={e => u('unitApt', e.target.value)} /></Field>
            <Field label="Property Type">
              <select value={form.propertyType} onChange={e => u('propertyType', e.target.value)}>
                <option value="">Select...</option>
                <option>Single Family</option><option>Condo</option><option>Townhouse</option><option>Multi-Family</option><option>Mobile Home</option>
              </select>
            </Field>
          </div>
        </>
      )}
    </div>
  );
}

function OtherSection({ form, setForm }) {
  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="pd-section-content">
      <div className="pd-section-title">Lead & Compliance</div>
      <div className="pr-form-row">
        <Field label="Lead Provided By"><input value={form.leadProvidedBy} onChange={e => u('leadProvidedBy', e.target.value)} /></Field>
        <Field label="Lead Source"><input value={form.leadSource} onChange={e => u('leadSource', e.target.value)} /></Field>
      </div>
      <Field label="Other Lead Source Description"><input value={form.otherLeadSource} onChange={e => u('otherLeadSource', e.target.value)} /></Field>
      <Field label="Primary Lead Owner"><input value={form.primaryLeadOwner} onChange={e => u('primaryLeadOwner', e.target.value)} /></Field>
      <div className="pr-toggle-row">
        <label className="pr-toggle-label"><input type="checkbox" checked={form.dncRequest} onChange={e => u('dncRequest', e.target.checked)} /> DNC Request</label>
        <label className="pr-toggle-label"><input type="checkbox" checked={form.emailOptOut} onChange={e => u('emailOptOut', e.target.checked)} /> Email Opt-Out</label>
        <label className="pr-toggle-label"><input type="checkbox" checked={form.smsOptOut} onChange={e => u('smsOptOut', e.target.checked)} /> SMS Opt-Out</label>
      </div>
    </div>
  );
}

function NotesSection({ notes, noteInput, setNoteInput, onAddNote }) {
  const handleAdd = () => {
    if (!noteInput.trim()) return;
    onAddNote(noteInput);
    setNoteInput('');
  };
  return (
    <div className="pd-section-content">
      <div className="pd-section-title">Notes</div>
      <div className="pr-notes-input-wrap">
        <textarea value={noteInput} onChange={e => setNoteInput(e.target.value)} placeholder="Add a note..." rows={3} />
        <button className="pr-note-add-btn" onClick={handleAdd}>Add Note</button>
      </div>
      <div className="pr-notes-list">
        {notes.length === 0 && <p className="pr-notes-empty">No notes yet</p>}
        {notes.map(n => (
          <div key={n.id} className="pr-note-item">
            <p>{n.text}</p>
            <span>{new Date(n.created_at).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InstagramIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433"/>
          <stop offset="25%" stopColor="#e6683c"/>
          <stop offset="50%" stopColor="#dc2743"/>
          <stop offset="75%" stopColor="#cc2366"/>
          <stop offset="100%" stopColor="#bc1888"/>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#ig)" strokeWidth="1.8"/>
      <circle cx="12" cy="12" r="4" stroke="url(#ig)" strokeWidth="1.8"/>
      <circle cx="17.5" cy="6.5" r="1" fill="url(#ig)"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.84 4.84 0 01-1.01-.06z"/>
    </svg>
  );
}

function OtherIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z"/>
    </svg>
  );
}

export default Prospects;