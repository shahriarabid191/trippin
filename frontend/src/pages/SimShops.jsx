import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';
import { getOperatorDetails } from '../data/simShopsData';
import { getShops, getMeta, submitShop, updateShop, withdrawSubmission, getMySubmissions } from '../api/simShopAPI';
import './SimShops.css';


// Operator badge info
const OPERATOR_OPTIONS = [
  { value: 'grameenphone', label: 'Grameenphone (GP)', color: '#00a651' },
  { value: 'robi',         label: 'Robi',              color: '#e2001a' },
  { value: 'banglalink',   label: 'Banglalink',         color: '#f7941d' },
  { value: 'teletalk',     label: 'Teletalk',           color: '#1a5276' },
  { value: 'airtel',       label: 'Airtel (Robi)',       color: '#ef3e42' },
];

const SERVICE_OPTIONS = [
  'New SIM', 'eSIM Activation', 'Biometric Registration', 'SIM Replacement',
  'Number Transfer (MNP)', 'Data Plans', 'Recharge', 'Postpaid Plans',
  'Corporate Plans', 'International Roaming', 'Bill Payment', 'Handset Sales',
];

const EMPTY_FORM = {
  name: '',
  district: '',
  area: '',
  address: '',
  landmark: '',
  phone: '',
  altPhone: '',
  email: '',
  hours: '',
  established: '',
  operators: [],
  services: [],
  esimSupport: false,
  mapLink: '',
  pdfFile: null,
};

// ─── Register Form Modal ─────────────────────────────────────────────────────
function RegisterModal({ user, meta, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        ...EMPTY_FORM,
        ...initialData,
        operators: initialData.operator || [],
        pdfFile: null,
      };
    }
    return EMPTY_FORM;
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Areas for the chosen district
  const districtAreas = meta.geography?.[form.district]?.map(g => g.area) || [];

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
  }

  function toggleOperator(val) {
    setForm(f => ({
      ...f,
      operators: f.operators.includes(val)
        ? f.operators.filter(o => o !== val)
        : [...f.operators, val],
    }));
  }

  function toggleService(val) {
    setForm(f => ({
      ...f,
      services: f.services.includes(val)
        ? f.services.filter(s => s !== val)
        : [...f.services, val],
    }));
  }

  function handlePDF(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfFile(file);
    setForm(f => ({ ...f, pdfFile: file.name })); // store name only for validation
  }

  function validate() {
    const errs = {};
    if (!form.name.trim())      errs.name     = 'Shop name is required';
    if (!form.district)         errs.district = 'District is required';
    if (!form.area.trim())      errs.area     = 'Area / location is required';
    if (!form.address.trim())   errs.address  = 'Address is required';
    if (!form.phone.trim())     errs.phone    = 'Phone number is required';
    if (!form.hours.trim())     errs.hours    = 'Opening hours are required';
    if (form.operators.length === 0) errs.operators = 'Select at least one operator';
    if (form.services.length === 0)  errs.services  = 'Select at least one service';
    if (!form.pdfFile && !initialData)  errs.pdfFile  = 'Please upload your shop document (PDF)';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("district", form.district);
      fd.append("area", form.area);
      fd.append("address", form.address);
      if (form.landmark) fd.append("landmark", form.landmark);
      fd.append("phone", form.phone);
      if (form.altPhone) fd.append("altPhone", form.altPhone);
      if (form.email) fd.append("email", form.email);
      fd.append("hours", form.hours);
      if (form.established) fd.append("established", form.established);
      if (form.mapLink) fd.append("mapLink", form.mapLink);
      fd.append("esimSupport", form.esimSupport);

      form.operators.forEach(o => fd.append("operators", o));
      form.services.forEach(s => fd.append("services", s));
      if (pdfFile) {
        fd.append("document", pdfFile);
      }

      let res;
      if (initialData) {
        res = await updateShop(initialData.id, fd);
      } else {
        res = await submitShop(fd);
      }
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => { onSubmit(res.submission); }, 2000);
    } catch (err) {
      setSubmitting(false);
      setSubmitError(err.message || "Failed to submit shop");
    }
  }

  if (success) {
    return (
      <div className="sim-modal-overlay" onClick={onClose}>
        <div className="sim-modal" onClick={e => e.stopPropagation()}>
          <div className="sim-modal-success">
            <span className="material-symbols-outlined sim-success-icon">check_circle</span>
            <h3>{initialData ? 'Shop Updated!' : 'Shop Submitted!'}</h3>
            <p>Your shop has been sent for review and will appear under <strong>{form.district} › {form.area}</strong> once approved by an admin.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sim-modal-overlay" onClick={onClose}>
      <div className="sim-modal" onClick={e => e.stopPropagation()}>
        {/* Modal header */}
        <div className="sim-modal-header">
          <div className="sim-modal-header-left">
            <span className="material-symbols-outlined">add_business</span>
            <div>
              <h3>{initialData ? 'Edit Your SIM / eSIM Shop' : 'Register Your SIM / eSIM Shop'}</h3>
              <p>Fill in your shop details {initialData ? '' : 'and upload verification documents.'}</p>
            </div>
          </div>
          <button className="sim-modal-close" onClick={onClose} title="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form className="sim-reg-form" onSubmit={handleSubmit} noValidate>
          <div className="sim-form-grid">

            {/* Shop Name */}
            <div className="sim-form-group sim-span-2">
              <label className="sim-form-label">
                <span className="material-symbols-outlined">storefront</span>
                Shop Name *
              </label>
              <input
                className={`sim-form-input${errors.name ? ' sim-input-error' : ''}`}
                type="text"
                placeholder="e.g. GP Express Banani"
                value={form.name}
                onChange={e => set('name', e.target.value)}
              />
              {errors.name && <span className="sim-field-error">{errors.name}</span>}
            </div>

            {/* District */}
            <div className="sim-form-group">
              <label className="sim-form-label">
                <span className="material-symbols-outlined">map</span>
                District *
              </label>
              <div className="sim-select-wrapper">
                <select
                  className={`sim-form-input sim-form-select${errors.district ? ' sim-input-error' : ''}`}
                  value={form.district}
                  onChange={e => { set('district', e.target.value); set('area', ''); }}
                >
                  <option value="">— Select District —</option>
                  {meta.districts?.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <span className="sim-select-arrow material-symbols-outlined">expand_more</span>
              </div>
              {errors.district && <span className="sim-field-error">{errors.district}</span>}
            </div>

            {/* Area */}
            <div className="sim-form-group">
              <label className="sim-form-label">
                <span className="material-symbols-outlined">place</span>
                Area / Thana / Location *
              </label>
              {districtAreas.length > 0 ? (
                <>
                  <div className="sim-select-wrapper">
                    <select
                      className={`sim-form-input sim-form-select${errors.area ? ' sim-input-error' : ''}`}
                      value={form.area}
                      onChange={e => set('area', e.target.value)}
                    >
                      <option value="">— Select Area —</option>
                      {districtAreas.map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                      <option value="__other__">Other (type below)</option>
                    </select>
                    <span className="sim-select-arrow material-symbols-outlined">expand_more</span>
                  </div>
                  {form.area === '__other__' && (
                    <input
                      className="sim-form-input"
                      type="text"
                      placeholder="Type your area name"
                      style={{ marginTop: 8 }}
                      onChange={e => set('area', e.target.value || '__other__')}
                    />
                  )}
                </>
              ) : (
                <input
                  className={`sim-form-input${errors.area ? ' sim-input-error' : ''}`}
                  type="text"
                  placeholder="e.g. Motijheel, Dhanmondi"
                  value={form.area}
                  onChange={e => set('area', e.target.value)}
                />
              )}
              {errors.area && <span className="sim-field-error">{errors.area}</span>}
            </div>

            {/* Address */}
            <div className="sim-form-group sim-span-2">
              <label className="sim-form-label">
                <span className="material-symbols-outlined">pin_drop</span>
                Exact Address *
              </label>
              <input
                className={`sim-form-input${errors.address ? ' sim-input-error' : ''}`}
                type="text"
                placeholder="e.g. House 42, Road 11, Block C, Banani, Dhaka-1213"
                value={form.address}
                onChange={e => set('address', e.target.value)}
              />
              {errors.address && <span className="sim-field-error">{errors.address}</span>}
            </div>

            {/* Landmark */}
            <div className="sim-form-group sim-span-2">
              <label className="sim-form-label">
                <span className="material-symbols-outlined">near_me</span>
                Landmark / Nearby Reference
              </label>
              <input
                className="sim-form-input"
                type="text"
                placeholder="e.g. Near Banani Club, opposite Dhaka Bank"
                value={form.landmark}
                onChange={e => set('landmark', e.target.value)}
              />
            </div>

            {/* Phone */}
            <div className="sim-form-group">
              <label className="sim-form-label">
                <span className="material-symbols-outlined">call</span>
                Primary Phone *
              </label>
              <input
                className={`sim-form-input${errors.phone ? ' sim-input-error' : ''}`}
                type="tel"
                placeholder="+880 1711-XXXXXX"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
              />
              {errors.phone && <span className="sim-field-error">{errors.phone}</span>}
            </div>

            {/* Alt Phone */}
            <div className="sim-form-group">
              <label className="sim-form-label">
                <span className="material-symbols-outlined">call</span>
                Alternate Phone
              </label>
              <input
                className="sim-form-input"
                type="tel"
                placeholder="+880 1XXX-XXXXXX (optional)"
                value={form.altPhone}
                onChange={e => set('altPhone', e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="sim-form-group">
              <label className="sim-form-label">
                <span className="material-symbols-outlined">email</span>
                Email Address
              </label>
              <input
                className="sim-form-input"
                type="email"
                placeholder="shop@example.com (optional)"
                value={form.email}
                onChange={e => set('email', e.target.value)}
              />
            </div>

            {/* Year Established */}
            <div className="sim-form-group">
              <label className="sim-form-label">
                <span className="material-symbols-outlined">calendar_today</span>
                Year Established
              </label>
              <input
                className="sim-form-input"
                type="number"
                placeholder="e.g. 2018"
                min="1990"
                max={new Date().getFullYear()}
                value={form.established}
                onChange={e => set('established', e.target.value)}
              />
            </div>

            {/* Opening Hours */}
            <div className="sim-form-group sim-span-2">
              <label className="sim-form-label">
                <span className="material-symbols-outlined">schedule</span>
                Opening Hours *
              </label>
              <input
                className={`sim-form-input${errors.hours ? ' sim-input-error' : ''}`}
                type="text"
                placeholder="e.g. Sat–Thu: 9:00 AM – 9:00 PM, Fri: 11:00 AM – 8:00 PM"
                value={form.hours}
                onChange={e => set('hours', e.target.value)}
              />
              {errors.hours && <span className="sim-field-error">{errors.hours}</span>}
            </div>

            {/* Google Maps Link */}
            <div className="sim-form-group sim-span-2">
              <label className="sim-form-label">
                <span className="material-symbols-outlined">map</span>
                Google Maps Link
              </label>
              <input
                className="sim-form-input"
                type="url"
                placeholder="https://maps.google.com/?q=... (optional)"
                value={form.mapLink}
                onChange={e => set('mapLink', e.target.value)}
              />
            </div>

            {/* Operators */}
            <div className="sim-form-group sim-span-2">
              <label className="sim-form-label">
                <span className="material-symbols-outlined">cell_tower</span>
                Operators Supported *
              </label>
              <div className="sim-checkbox-grid">
                {OPERATOR_OPTIONS.map(op => (
                  <label
                    key={op.value}
                    className={`sim-checkbox-label${form.operators.includes(op.value) ? ' sim-checkbox-checked' : ''}`}
                    style={{ '--op-color': op.color }}
                  >
                    <input
                      type="checkbox"
                      checked={form.operators.includes(op.value)}
                      onChange={() => toggleOperator(op.value)}
                    />
                    <span>{op.label}</span>
                  </label>
                ))}
              </div>
              {errors.operators && <span className="sim-field-error">{errors.operators}</span>}
            </div>

            {/* Services */}
            <div className="sim-form-group sim-span-2">
              <label className="sim-form-label">
                <span className="material-symbols-outlined">checklist</span>
                Services Offered *
              </label>
              <div className="sim-checkbox-grid sim-checkbox-grid-sm">
                {SERVICE_OPTIONS.map(svc => (
                  <label
                    key={svc}
                    className={`sim-checkbox-label sim-service-check${form.services.includes(svc) ? ' sim-checkbox-checked' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={form.services.includes(svc)}
                      onChange={() => toggleService(svc)}
                    />
                    <span>{svc}</span>
                  </label>
                ))}
              </div>
              {errors.services && <span className="sim-field-error">{errors.services}</span>}
            </div>

            {/* eSIM toggle */}
            <div className="sim-form-group sim-span-2">
              <label className="sim-esim-toggle">
                <input
                  type="checkbox"
                  checked={form.esimSupport}
                  onChange={e => set('esimSupport', e.target.checked)}
                />
                <div className="sim-toggle-track">
                  <div className="sim-toggle-thumb" />
                </div>
                <div>
                  <span className="sim-toggle-label">eSIM Activation Available</span>
                  <span className="sim-toggle-sub">Check if your shop supports eSIM setup</span>
                </div>
              </label>
            </div>

            {/* PDF Upload */}
            <div className="sim-form-group sim-span-2">
              <label className="sim-form-label">
                <span className="material-symbols-outlined">upload_file</span>
                Shop Verification Document (PDF) *
              </label>
              <label className={`sim-pdf-upload${errors.pdfFile ? ' sim-pdf-error' : ''}`}>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePDF}
                  hidden
                />
                <div className="sim-pdf-inner">
                  {form.pdfFile ? (
                    <>
                      <span className="material-symbols-outlined sim-pdf-icon-ok">description</span>
                      <div>
                        <span className="sim-pdf-filename">{form.pdfFile}</span>
                        <span className="sim-pdf-sub">Click to change file</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined sim-pdf-icon">upload_file</span>
                      <div>
                        <span className="sim-pdf-prompt">Click to upload shop verification PDF</span>
                        <span className="sim-pdf-sub">Trade license, authority letter, or other official document</span>
                      </div>
                    </>
                  )}
                </div>
              </label>
              {errors.pdfFile && <span className="sim-field-error">{errors.pdfFile}</span>}
            </div>

          </div>

          {submitError && <div className="sim-field-error" style={{ padding: '0 24px' }}>{submitError}</div>}

          {/* Submit */}
          <div className="sim-form-footer">
            <button type="button" className="sim-form-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="sim-form-submit" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="sim-form-spinner" />
                  Registering…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">check_circle</span>
                  Register Shop
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function SimShops() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [expandedShop, setExpandedShop] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingShop, setEditingShop] = useState(null);
  const [visiblePhone, setVisiblePhone] = useState(null);

  const [meta, setMeta] = useState({ districts: [], operators: {}, services: [], geography: {} });
  const [shops, setShops] = useState([]);
  const [loadingShops, setLoadingShops] = useState(false);
  const [myShops, setMyShops] = useState([]);

  useEffect(() => {
    getMeta().then(setMeta).catch(console.error);
  }, []);

  const loadMyShops = () => {
    if (user) {
      getMySubmissions().then(setMyShops).catch(console.error);
    } else {
      setMyShops([]);
    }
  };

  useEffect(() => {
    loadMyShops();
  }, [user]);

  useEffect(() => {
    if (selectedDistrict && selectedArea) {
      setLoadingShops(true);
      getShops({ district: selectedDistrict, area: selectedArea })
        .then(setShops)
        .catch(console.error)
        .finally(() => setLoadingShops(false));
    } else {
      setShops([]);
    }
  }, [selectedDistrict, selectedArea]);

  const areas = selectedDistrict && meta.geography[selectedDistrict] 
    ? meta.geography[selectedDistrict].map(g => g.area) 
    : [];

  function handleDistrictChange(e) {
    setSelectedDistrict(e.target.value);
    setSelectedArea('');
    setExpandedShop(null);
  }

  function handleAreaChange(e) {
    setSelectedArea(e.target.value);
    setExpandedShop(null);
  }

  function handleRegisterSubmit(newShop) {
    setShowModal(false);
    setSelectedDistrict(newShop.district);
    setSelectedArea(newShop.area);
  }

  function togglePhone(shopId) {
    setVisiblePhone(prev => prev === shopId ? null : shopId);
  }

  const handleDelete = async (id, isMyList = false) => {
    if (!window.confirm("Are you sure you want to delete this shop?")) return;
    try {
      await withdrawSubmission(id);
      if (isMyList) {
          setMyShops(prev => prev.filter(s => s.id !== id));
      }
      setShops(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert("Failed to delete shop: " + err.message);
    }
  };

  return (
    <div className="page sim-page">
      {(showModal || editingShop) && user && (
        <RegisterModal
          user={user}
          meta={meta}
          initialData={editingShop}
          onClose={() => { setShowModal(false); setEditingShop(null); }}
          onSubmit={(shop) => {
            setShowModal(false);
            setEditingShop(null);
            loadMyShops();
            if (editingShop) {
                setShops(prev => prev.filter(s => s.id !== shop.id));
            } else {
                handleRegisterSubmit(shop);
            }
          }}
        />
      )}

      <main className="subpage-content sim-content">

        {/* Hero Banner */}
        <div className="sim-hero">
          <div className="sim-hero-icon">
            <span className="material-symbols-outlined">sim_card</span>
          </div>
          <div className="sim-hero-text">
            <h2>SIM &amp; eSIM Shops</h2>
            <p>Find nearby SIM &amp; eSIM shops across Bangladesh — pick your district and area to discover verified stores.</p>
          </div>
          <div className="sim-hero-right">
            <div className="sim-hero-badges">
              <span className="sim-badge sim-badge-gp">Grameenphone</span>
              <span className="sim-badge sim-badge-robi">Robi</span>
              <span className="sim-badge sim-badge-bl">Banglalink</span>
              <span className="sim-badge sim-badge-tt">Teletalk</span>
            </div>
            {/* Register button */}
            <button
              className="sim-register-btn"
              onClick={() => {
                if (!user) { navigate('/login'); return; }
                setShowModal(true);
              }}
            >
              <span className="material-symbols-outlined">add_business</span>
              Register Your Shop
            </button>
          </div>
        </div>

        {/* My Submissions */}
        {user && myShops.length > 0 && (
          <div className="sim-my-shops" style={{ padding: '0 2rem', maxWidth: '1200px', margin: '0 auto', marginBottom: '40px' }}>
            <h3 className="sim-finder-title" style={{ marginTop: '2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined">manage_accounts</span>
              Manage My Shops
            </h3>
            <div className="sim-shop-list">
              {myShops.map((shop) => (
                <div key={shop.id} className="sim-shop-card" style={{ borderLeft: shop.status === 'approved' ? '4px solid #00a651' : shop.status === 'rejected' ? '4px solid #e2001a' : '4px solid #f7941d', padding: '16px' }}>
                    <div className="sim-shop-header" style={{ cursor: 'default', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="sim-shop-left" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div className="sim-shop-icon-wrap" style={{ background: '#f5f5f5', borderRadius: '50%', padding: '12px' }}>
                          <span className="material-symbols-outlined">storefront</span>
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <h4 className="sim-shop-name" style={{ margin: 0 }}>{shop.name}</h4>
                            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 12, background: shop.status === 'approved' ? '#e6f6eb' : shop.status === 'rejected' ? '#fce6e8' : '#fef4e8', color: shop.status === 'approved' ? '#00a651' : shop.status === 'rejected' ? '#e2001a' : '#f7941d', fontWeight: 600, textTransform: 'uppercase' }}>
                              {shop.status}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#666', marginTop: 4 }}>
                            {shop.district} › {shop.area}
                          </div>
                          {shop.status === 'rejected' && shop.rejection_reason && (
                              <div style={{ fontSize: '0.85rem', color: '#e2001a', marginTop: 4 }}>
                                  Reason: {shop.rejection_reason}
                              </div>
                          )}
                        </div>
                      </div>
                      <div className="sim-shop-right" style={{ display: 'flex', alignItems: 'center' }}>
                        <div className="sim-shop-actions" style={{ display: 'flex', gap: 8 }}>
                          <button className="sim-btn-icon" onClick={() => setEditingShop(shop)} title="Edit Shop" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333' }}>
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button className="sim-btn-icon" onClick={() => handleDelete(shop.id, true)} title="Delete Shop" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e2001a' }}>
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info strip */}
        <div className="sim-info-strip">
          <div className="sim-info-item">
            <span className="material-symbols-outlined">location_on</span>
            <span>64 Districts Covered</span>
          </div>
          <div className="sim-info-item">
            <span className="material-symbols-outlined">store</span>
            <span>Verified Shops</span>
          </div>
          <div className="sim-info-item">
            <span className="material-symbols-outlined">wifi</span>
            <span>eSIM Available</span>
          </div>
          <div className="sim-info-item">
            <span className="material-symbols-outlined">phone_iphone</span>
            <span>All Major Operators</span>
          </div>
        </div>

        {/* Finder Section */}
        <div className="sim-finder">
          <div className="sim-finder-title-row">
            <h3 className="sim-finder-title">
              <span className="material-symbols-outlined">search</span>
              Find Shops Near You
            </h3>
          </div>

          <div className="sim-selectors">
            {/* District Selector */}
            <div className="sim-select-group">
              <label htmlFor="district-select" className="sim-select-label">
                <span className="material-symbols-outlined">map</span>
                Select District
              </label>
              <div className="sim-select-wrapper">
                <select
                  id="district-select"
                  className="sim-select"
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                >
                  <option value="">— Choose a District —</option>
                  {meta.districts?.map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
                <span className="sim-select-arrow material-symbols-outlined">expand_more</span>
              </div>
            </div>

            {/* Area Selector */}
            {selectedDistrict && (
              <div className="sim-select-group sim-select-group-area">
                <label htmlFor="area-select" className="sim-select-label">
                  <span className="material-symbols-outlined">place</span>
                  Select Area
                </label>
                {areas.length === 0 ? (
                  <div className="sim-no-areas">
                    <span className="material-symbols-outlined">info</span>
                    No shops listed yet for <strong>{selectedDistrict}</strong>. Be the first to&nbsp;
                    <button className="sim-register-inline" onClick={() => { if (!user) { navigate('/login'); return; } setShowModal(true); }}>
                      register one!
                    </button>
                  </div>
                ) : (
                  <div className="sim-select-wrapper">
                    <select
                      id="area-select"
                      className="sim-select"
                      value={selectedArea}
                      onChange={handleAreaChange}
                    >
                      <option value="">— Choose an Area —</option>
                      {areas.map((area) => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                    <span className="sim-select-arrow material-symbols-outlined">expand_more</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Breadcrumb */}
          {selectedDistrict && (
            <div className="sim-breadcrumb">
              <span onClick={() => { setSelectedDistrict(''); setSelectedArea(''); }} className="sim-bc-link">All Districts</span>
              <span className="material-symbols-outlined">chevron_right</span>
              <span onClick={() => setSelectedArea('')} className={`sim-bc-link ${!selectedArea ? 'sim-bc-active' : ''}`}>{selectedDistrict}</span>
              {selectedArea && (
                <>
                  <span className="material-symbols-outlined">chevron_right</span>
                  <span className="sim-bc-active">{selectedArea}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {shops.length > 0 && (
          <div className="sim-results">
            <div className="sim-results-header">
              <h3>
                <span className="material-symbols-outlined">storefront</span>
                {shops.length} Shop{shops.length !== 1 ? 's' : ''} in {selectedArea}, {selectedDistrict}
              </h3>
              <span className="sim-results-note">All shops verified · Data updated 2025</span>
            </div>

            <div className="sim-shop-list">
              {shops.map((shop) => {
                const isExpanded = expandedShop === shop.id;
                const phoneVisible = visiblePhone === shop.id;

                return (
                  <div key={shop.id} className={`sim-shop-card${isExpanded ? ' sim-shop-card-expanded' : ''}`}>

                    {/* Card Header */}
                    <div className="sim-shop-header" onClick={() => setExpandedShop(isExpanded ? null : shop.id)}>
                      <div className="sim-shop-left">
                        <div className="sim-shop-icon-wrap">
                          <span className="material-symbols-outlined">storefront</span>
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <h4 className="sim-shop-name">{shop.name}</h4>
                          </div>
                          <div className="sim-shop-operators">
                            {shop.operator.map((op) => {
                              const opData = getOperatorDetails(op);
                              return (
                                <span key={op} className="sim-op-badge" style={{ '--op-color': opData.color }}>
                                  {opData.name}
                                </span>
                              );
                            })}
                            {shop.esimSupport && (
                              <span className="sim-esim-badge">
                                <span className="material-symbols-outlined">wifi</span> eSIM
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="sim-shop-right" style={{ display: 'flex', alignItems: 'center' }}>
                        <span className={`sim-expand-icon material-symbols-outlined${isExpanded ? ' rotated' : ''}`}>
                          expand_more
                        </span>
                      </div>
                    </div>

                    {/* Quick info (always visible) */}
                    <div className="sim-shop-quick">
                      <div className="sim-quick-item">
                        <span className="material-symbols-outlined">location_on</span>
                        <span>{shop.address}</span>
                      </div>
                      <div className="sim-quick-item">
                        <span className="material-symbols-outlined">call</span>
                        <span className="sim-phone-text">{shop.phone}</span>
                      </div>
                      <div className="sim-quick-item">
                        <span className="material-symbols-outlined">schedule</span>
                        <span>{shop.hours}</span>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="sim-shop-details">
                        <div className="sim-details-grid">

                          {/* Contact & Location */}
                          <div className="sim-detail-section">
                            <h5>
                              <span className="material-symbols-outlined">contact_phone</span>
                              Contact &amp; Location
                            </h5>
                            <ul className="sim-detail-list">
                              <li>
                                <span className="material-symbols-outlined">call</span>
                                <div>
                                  <span className="sim-dl-label">Primary Phone</span>
                                  <span className="sim-phone-text">{shop.phone}</span>
                                </div>
                              </li>
                              {shop.altPhone && (
                                <li>
                                  <span className="material-symbols-outlined">call</span>
                                  <div>
                                    <span className="sim-dl-label">Alt Phone</span>
                                    <span className="sim-phone-text">{shop.altPhone}</span>
                                  </div>
                                </li>
                              )}
                              {shop.email && (
                                <li>
                                  <span className="material-symbols-outlined">email</span>
                                  <div>
                                    <span className="sim-dl-label">Email</span>
                                    <a href={`mailto:${shop.email}`} className="sim-phone-link">{shop.email}</a>
                                  </div>
                                </li>
                              )}
                              <li>
                                <span className="material-symbols-outlined">pin_drop</span>
                                <div>
                                  <span className="sim-dl-label">Exact Address</span>
                                  <span>{shop.address}</span>
                                </div>
                              </li>
                              {shop.landmark && (
                                <li>
                                  <span className="material-symbols-outlined">near_me</span>
                                  <div>
                                    <span className="sim-dl-label">Landmark</span>
                                    <span>{shop.landmark}</span>
                                  </div>
                                </li>
                              )}
                              {shop.mapLink && (
                                <li>
                                  <span className="material-symbols-outlined">map</span>
                                  <div>
                                    <span className="sim-dl-label">Map</span>
                                    <a href={shop.mapLink} target="_blank" rel="noopener noreferrer" className="sim-map-link">
                                      Open in Google Maps
                                      <span className="material-symbols-outlined">open_in_new</span>
                                    </a>
                                  </div>
                                </li>
                              )}
                            </ul>
                          </div>

                          {/* Business Info */}
                          <div className="sim-detail-section">
                            <h5>
                              <span className="material-symbols-outlined">business</span>
                              Business Info
                            </h5>
                            <ul className="sim-detail-list">
                              <li>
                                <span className="material-symbols-outlined">schedule</span>
                                <div>
                                  <span className="sim-dl-label">Opening Hours</span>
                                  <span>{shop.hours}</span>
                                </div>
                              </li>
                              <li>
                                <span className="material-symbols-outlined">calendar_today</span>
                                <div>
                                  <span className="sim-dl-label">Established</span>
                                  <span>{shop.established}</span>
                                </div>
                              </li>
                              <li>
                                <span className="material-symbols-outlined">wifi</span>
                                <div>
                                  <span className="sim-dl-label">eSIM Support</span>
                                  <span className={shop.esimSupport ? 'sim-yes' : 'sim-no'}>
                                    {shop.esimSupport ? '✓ Yes — eSIM activation available' : '✗ No — Physical SIM only'}
                                  </span>
                                </div>
                              </li>
                            </ul>
                          </div>

                          {/* Services */}
                          <div className="sim-detail-section sim-detail-full">
                            <h5>
                              <span className="material-symbols-outlined">checklist</span>
                              Available Services
                            </h5>
                            <div className="sim-services-grid">
                              {shop.services.map((svc) => (
                                <span key={svc} className="sim-service-chip">
                                  <span className="material-symbols-outlined">check_circle</span>
                                  {svc}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Operators */}
                          <div className="sim-detail-section sim-detail-full">
                            <h5>
                              <span className="material-symbols-outlined">cell_tower</span>
                              Operators Available
                            </h5>
                            <div className="sim-operator-cards">
                              {shop.operator.map((op) => {
                                const opData = getOperatorDetails(op);
                                return (
                                  <div key={op} className="sim-operator-card" style={{ '--op-color': opData.color }}>
                                    <span className="sim-op-logo">{opData.logo}</span>
                                    <span className="sim-op-name">{opData.name}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                        </div>

                        {/* Action buttons */}
                        <div className="sim-shop-actions">
                          {/* Call Now — shows number inline, no href tel */}
                          <button
                            className="sim-action-btn sim-action-call"
                            onClick={() => togglePhone(shop.id)}
                          >
                            <span className="material-symbols-outlined">call</span>
                            {phoneVisible ? shop.phone : 'Call Now'}
                          </button>

                          {shop.mapLink && (
                            <a href={shop.mapLink} target="_blank" rel="noopener noreferrer" className="sim-action-btn sim-action-map">
                              <span className="material-symbols-outlined">directions</span>
                              Get Directions
                            </a>
                          )}
                          {shop.email && (
                            <a href={`mailto:${shop.email}`} className="sim-action-btn sim-action-email">
                              <span className="material-symbols-outlined">email</span>
                              Email Shop
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No results state */}
        {selectedDistrict && selectedArea && shops.length === 0 && (
          <div className="sim-empty">
            <span className="material-symbols-outlined">search_off</span>
            <h3>No Shops Found</h3>
            <p>We don't have listings for <strong>{selectedArea}, {selectedDistrict}</strong> yet.</p>
            <button
              className="sim-register-prompt-btn"
              onClick={() => { if (!user) { navigate('/login'); return; } setShowModal(true); }}
            >
              <span className="material-symbols-outlined">add_business</span>
              Register the first shop here
            </button>
          </div>
        )}

        {/* Prompt when nothing selected */}
        {!selectedDistrict && (
          <div className="sim-prompt">
            <div className="sim-prompt-illustration">
              <span className="material-symbols-outlined sim-prompt-icon">sim_card</span>
              <div className="sim-prompt-rings">
                <div className="sim-ring sim-ring-1"></div>
                <div className="sim-ring sim-ring-2"></div>
                <div className="sim-ring sim-ring-3"></div>
              </div>
            </div>
            <h3>Browse All 64 Districts</h3>
            <p>Select a district above to find SIM and eSIM shops in your area.</p>
            <div className="sim-quick-districts">
              <p className="sim-qd-label">Popular Districts:</p>
              {["Dhaka", "Cox's Bazar", 'Chattogram', 'Sylhet', 'Khulna'].map(d => (
                <button
                  key={d}
                  className="sim-quick-district-btn"
                  onClick={() => { setSelectedDistrict(d); setSelectedArea(''); }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tips section */}
        <div className="sim-tips">
          <h3 className="sim-tips-title">
            <span className="material-symbols-outlined">lightbulb</span>
            Helpful Tips for Getting a SIM in Bangladesh
          </h3>
          <div className="sim-tips-grid">
            <div className="sim-tip-card">
              <span className="material-symbols-outlined">badge</span>
              <h4>Required Documents</h4>
              <p>Bring your National ID Card (NID) or Passport for biometric registration. Without biometric, the SIM won't be activated.</p>
            </div>
            <div className="sim-tip-card">
              <span className="material-symbols-outlined">fingerprint</span>
              <h4>Biometric Registration</h4>
              <p>All SIMs require biometric fingerprint scan linked to your NID. The process takes about 5–10 minutes at any official shop.</p>
            </div>
            <div className="sim-tip-card">
              <span className="material-symbols-outlined">wifi</span>
              <h4>eSIM Activation</h4>
              <p>eSIM available for compatible iPhones and Android devices. Bring your phone and a QR code will be generated on the spot.</p>
            </div>
            <div className="sim-tip-card">
              <span className="material-symbols-outlined">currency_taka</span>
              <h4>SIM Cost</h4>
              <p>New SIM cards typically cost BDT 100–200 and include starter bundles. Data packs range from BDT 50 to 500+.</p>
            </div>
            <div className="sim-tip-card">
              <span className="material-symbols-outlined">compare_arrows</span>
              <h4>Number Portability</h4>
              <p>You can switch operators while keeping your number. Visit an authorized service center with your NID to request MNP.</p>
            </div>
            <div className="sim-tip-card">
              <span className="material-symbols-outlined">flight</span>
              <h4>Tourist SIMs</h4>
              <p>Special tourist SIM packages are available at Cox's Bazar and Dhaka Airport with pre-loaded data valid for 7–30 days.</p>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
