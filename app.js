// ══════════════════════════════════════════════
//  DATABASE — localStorage persistence
// ══════════════════════════════════════════════

function dbGet(key, fallback) {
  try {
    const val = localStorage.getItem('medicore_' + key);
    return val ? JSON.parse(val) : fallback;
  } catch { return fallback; }
}

function dbSet(key, value) {
  localStorage.setItem('medicore_' + key, JSON.stringify(value));
}

// Initialize default data if first time
function initDB() {
  if (!dbGet('initialized', false)) {
    dbSet('patients', [
      { id:'MC-2024-001', name:'Ahmed Raza',    age:34, gender:'Male',   phone:'0301-1234567', blood:'B+', address:'House 12, Block A, Lahore',    joined:'2024-01-15' },
      { id:'MC-2024-002', name:'Sana Malik',    age:28, gender:'Female', phone:'0311-9876543', blood:'O+', address:'Flat 5, DHA Phase 4, Lahore',   joined:'2024-02-20' },
      { id:'MC-2024-003', name:'Tariq Hassan',  age:52, gender:'Male',   phone:'0321-4567890', blood:'A-', address:'Street 7, Gulberg III, Lahore', joined:'2024-03-05' },
    ]);
    dbSet('records', [
      { id:'R001', patientId:'MC-2024-001', date:'2024-01-15', diagnosis:'Seasonal Flu',           notes:'Fever 38.5C, sore throat, runny nose. Rest and fluids advised.',    meds:['Paracetamol 500mg','Antihistamine'],      doctor:'Dr. Imran Khan' },
      { id:'R002', patientId:'MC-2024-001', date:'2024-03-10', diagnosis:'Hypertension Follow-Up', notes:'BP 145/92. Controlled. Low sodium diet and daily walks advised.',    meds:['Amlodipine 5mg','Losartan 50mg'],         doctor:'Dr. Imran Khan' },
      { id:'R003', patientId:'MC-2024-002', date:'2024-02-20', diagnosis:'Iron Deficiency Anemia', notes:'Hemoglobin 9.2g/dL. Fatigue and dizziness. Dietary advice given.',  meds:['Iron Supplement 150mg','Vitamin C 500mg'], doctor:'Dr. Fareeha Shah' },
      { id:'R004', patientId:'MC-2024-003', date:'2024-03-05', diagnosis:'Type 2 Diabetes',        notes:'HbA1c 8.2%. Fasting glucose 165mg/dL. Lifestyle changes advised.',  meds:['Metformin 500mg','Glucophage XR'],         doctor:'Dr. Imran Khan' },
      { id:'R005', patientId:'MC-2024-003', date:'2024-04-12', diagnosis:'Diabetes Follow-up',     notes:'Blood sugar improved. Knee pain noted, possible early osteoarthritis.',meds:['Metformin 1000mg','Voltaren Gel'],         doctor:'Dr. Fareeha Shah' },
    ]);
    dbSet('initialized', true);
  }
}

// Helper getters/setters
function getPatients()  { return dbGet('patients', []); }
function getRecords()   { return dbGet('records',  []); }
function savePatients(p){ dbSet('patients', p); }
function saveRecords(r) { dbSet('records',  r); }

function getPatientById(id) { return getPatients().find(p => p.id === id); }
function getRecordsForPatient(id) {
  return getRecords().filter(r => r.patientId === id).sort((a,b)=> b.date.localeCompare(a.date));
}

function generatePatientId() {
  const patients = getPatients();
  const num = patients.length + 1;
  return `MC-2024-${String(num).padStart(3,'0')}`;
}

function generateRecordId() {
  return 'R' + Date.now();
}

// ── Staff credentials ──
const STAFF = {
  admin:  { password:'admin123', role:'admin',  name:'Administrator' },
  doctor: { password:'doc123',   role:'doctor', name:'Dr. Imran Khan' },
};

// ══════════════════════════════════════════════
//  SESSION
// ══════════════════════════════════════════════
let currentUser = null;
let currentRole = null;
let activePatientId = null; // for patient login
let addRecordForPatientId = null;

// ══════════════════════════════════════════════
//  SCREEN MANAGEMENT
// ══════════════════════════════════════════════
function goScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('on'));
  document.getElementById(id).classList.add('on');
}

// ══════════════════════════════════════════════
//  NAVIGATION
// ══════════════════════════════════════════════
function goLogin(role) {
  currentRole = role;
  const tags = { admin:'🏢 Admin', doctor:'👨‍⚕️ Doctor', patient:'🪪 Patient' };
  document.getElementById('login-tag').textContent = tags[role];
  document.getElementById('login-staff').style.display   = role !== 'patient' ? 'block' : 'none';
  document.getElementById('login-patient').style.display = role === 'patient'  ? 'block' : 'none';
  document.getElementById('login-err').style.display = 'none';
  document.getElementById('inp-user') && (document.getElementById('inp-user').value = '');
  document.getElementById('inp-pass') && (document.getElementById('inp-pass').value = '');
  document.getElementById('inp-pid')  && (document.getElementById('inp-pid').value  = '');

  const hints = {
    admin:  '🔑 <strong>Demo:</strong> Username: <strong>admin</strong> &nbsp;/&nbsp; Password: <strong>admin123</strong>',
    doctor: '🔑 <strong>Demo:</strong> Username: <strong>doctor</strong> &nbsp;/&nbsp; Password: <strong>doc123</strong>',
  };
  const hint = document.getElementById('demo-hint');
  if (hint) hint.innerHTML = hints[role] || '';
  goScreen('s-login');
}

function showLoginErr(msg) {
  const el = document.getElementById('login-err');
  el.textContent = '❌ ' + msg;
  el.style.display = 'block';
}

// ══════════════════════════════════════════════
//  LOGIN LOGIC
// ══════════════════════════════════════════════
function doLogin() {
  const username = document.getElementById('inp-user').value.trim();
  const password = document.getElementById('inp-pass').value.trim();

  if (!username || !password) return showLoginErr('Please fill in all fields.');

  const staff = STAFF[username];
  if (!staff || staff.password !== password || staff.role !== currentRole)
    return showLoginErr('Invalid username or password.');

  currentUser = { username, role: staff.role, name: staff.name };
  loadApp();
}

function doPatientLogin() {
  const pid = document.getElementById('inp-pid').value.trim().toUpperCase();
  if (!pid) return showLoginErr('Please enter your Patient ID.');

  const patient = getPatientById(pid);
  if (!patient) return showLoginErr('Patient ID not found. Please check and try again.');

  currentUser = { username: pid, role: 'patient', name: patient.name };
  activePatientId = pid;
  loadApp();
}

function doLogout() {
  currentUser = null;
  currentRole = null;
  activePatientId = null;
  goScreen('s-land');
}

// ══════════════════════════════════════════════
//  LOAD APP SHELL
// ══════════════════════════════════════════════
function loadApp() {
  // Set sidebar info
  const badges = { admin:'🏢 Admin Panel', doctor:'👨‍⚕️ Doctor Portal', patient:'🪪 Patient Portal' };
  document.getElementById('sb-badge').textContent = badges[currentUser.role];
  document.getElementById('sb-avatar').textContent = currentUser.name[0].toUpperCase();
  document.getElementById('sb-uname').textContent  = currentUser.name;
  document.getElementById('sb-urole').textContent  = currentUser.role;

  // Set date
  document.getElementById('topbar-date').textContent =
    new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  // Build sidebar nav
  buildNav();

  // Load default page
  const defaultPage = { admin:'dashboard', doctor:'search', patient:'myrecords' };
  loadPage(defaultPage[currentUser.role]);

  goScreen('s-app');
}

// ══════════════════════════════════════════════
//  SIDEBAR NAV
// ══════════════════════════════════════════════
const NAV = {
  admin: [
    { id:'dashboard',    icon:'📊', label:'Dashboard' },
    { id:'allpatients',  icon:'👥', label:'All Patients' },
    { id:'register',     icon:'➕', label:'Register Patient' },
    { id:'search',       icon:'🔍', label:'Search Patient' },
  ],
  doctor: [
    { id:'search',       icon:'🔍', label:'Search Patient' },
    { id:'allpatients',  icon:'👥', label:'Patient List' },
  ],
  patient: [
    { id:'myrecords',    icon:'📋', label:'My Records' },
  ],
};

function buildNav() {
  const items = NAV[currentUser.role] || [];
  document.getElementById('sb-nav').innerHTML = items.map(item =>
    `<button class="sb-item" id="nav-${item.id}" onclick="loadPage('${item.id}')">
      <span class="sb-icon">${item.icon}</span>${item.label}
    </button>`
  ).join('');
}

function setActiveNav(pageId) {
  document.querySelectorAll('.sb-item').forEach(el => el.classList.remove('active'));
  const el = document.getElementById('nav-' + pageId);
  if (el) el.classList.add('active');
}

// ══════════════════════════════════════════════
//  PAGE ROUTER
// ══════════════════════════════════════════════
function loadPage(pageId) {
  setActiveNav(pageId);
  const titles = {
    dashboard:'📊 Dashboard', allpatients:'👥 All Patients',
    register:'➕ Register Patient', search:'🔍 Search Patient', myrecords:'📋 My Records'
  };
  document.getElementById('topbar-title').textContent = titles[pageId] || '';

  const pages = {
    dashboard:   renderDashboard,
    allpatients: renderAllPatients,
    register:    renderRegister,
    search:      renderSearch,
    myrecords:   renderMyRecords,
  };

  if (pages[pageId]) {
    document.getElementById('page-body').innerHTML = pages[pageId]();
    if (pageId === 'myrecords') renderProfileInto('myrecords-profile', activePatientId, false);
  }
}

// ══════════════════════════════════════════════
//  PAGE: DASHBOARD (Admin only)
// ══════════════════════════════════════════════
function renderDashboard() {
  const patients = getPatients();
  const records  = getRecords();
  const recent   = [...records].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);

  const recentRows = recent.map(r => {
    const p = getPatientById(r.patientId);
    return `<tr>
      <td><strong>${p?.name ?? '—'}</strong></td>
      <td><span class="badge b-teal">${r.patientId}</span></td>
      <td>${r.diagnosis}</td>
      <td>${r.date}</td>
      <td>${r.doctor}</td>
    </tr>`;
  }).join('');

  return `
  <div class="stats">
    <div class="stat"><div class="stat-icon">👥</div><div class="stat-num">${patients.length}</div><div class="stat-lbl">Total Patients</div></div>
    <div class="stat"><div class="stat-icon">📋</div><div class="stat-num">${records.length}</div><div class="stat-lbl">Total Records</div></div>
    <div class="stat"><div class="stat-icon">👨‍⚕️</div><div class="stat-num">2</div><div class="stat-lbl">Doctors</div></div>
    <div class="stat"><div class="stat-icon">🏥</div><div class="stat-num">1</div><div class="stat-lbl">Clinic</div></div>
  </div>
  <div class="card">
    <div class="card-head">
      <div class="card-title">📋 Recent Visits</div>
      <button class="btn btn-o btn-sm" onclick="loadPage('allpatients')">View All →</button>
    </div>
    <div class="tbl-wrap">
      <table>
        <thead><tr><th>Patient</th><th>ID</th><th>Diagnosis</th><th>Date</th><th>Doctor</th></tr></thead>
        <tbody>${recentRows || '<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:30px;">No records yet</td></tr>'}</tbody>
      </table>
    </div>
  </div>`;
}

// ══════════════════════════════════════════════
//  PAGE: ALL PATIENTS
// ══════════════════════════════════════════════
function renderAllPatients() {
  const patients = getPatients();
  const records  = getRecords();
  const isAdmin  = currentUser.role === 'admin';

  const rows = patients.map(p => {
    const visits = records.filter(r => r.patientId === p.id).length;
    const actionBtn = `<button class="btn btn-o btn-sm" onclick="searchFor('${p.id}')">View</button>`;
    return `<tr>
      <td><span class="badge b-teal">${p.id}</span></td>
      <td><strong>${p.name}</strong></td>
      <td>${p.age} yrs</td>
      <td>${p.gender}</td>
      <td><span class="badge b-red">${p.blood}</span></td>
      <td>${p.phone}</td>
      <td><span class="badge b-green">${visits}</span></td>
      <td>${actionBtn}</td>
    </tr>`;
  }).join('');

  return `
  <div class="card">
    <div class="card-head">
      <div class="card-title">All Registered Patients</div>
      ${isAdmin ? `<button class="btn btn-p btn-sm" onclick="loadPage('register')">➕ Register New</button>` : ''}
    </div>
    <div class="tbl-wrap">
      <table>
        <thead><tr><th>Patient ID</th><th>Name</th><th>Age</th><th>Gender</th><th>Blood</th><th>Phone</th><th>Visits</th><th>Action</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="8" style="text-align:center;color:#94a3b8;padding:30px;">No patients registered yet</td></tr>'}</tbody>
      </table>
    </div>
  </div>`;
}

// ══════════════════════════════════════════════
//  PAGE: REGISTER PATIENT (Admin only)
// ══════════════════════════════════════════════
function renderRegister() {
  const newId = generatePatientId();
  return `
  <div class="id-box">
    <div>
      <div class="id-lbl">Auto-Generated Patient ID</div>
      <div class="id-val" id="gen-id">${newId}</div>
    </div>
    <button class="btn-copy" onclick="copyId()">📋 Copy</button>
  </div>
  <div class="card">
    <div class="card-title" style="margin-bottom:20px;">Patient Information</div>
    <div id="reg-alert"></div>
    <div class="form-grid">
      <div class="fg"><label>Full Name *</label><input id="reg-name" placeholder="Patient full name"></div>
      <div class="fg"><label>Age *</label><input id="reg-age" type="number" placeholder="Age in years" min="0" max="130"></div>
      <div class="fg">
        <label>Gender *</label>
        <select id="reg-gender">
          <option value="">Select gender</option>
          <option>Male</option><option>Female</option><option>Other</option>
        </select>
      </div>
      <div class="fg">
        <label>Blood Group</label>
        <select id="reg-blood">
          <option value="">Select</option>
          <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
          <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
        </select>
      </div>
      <div class="fg"><label>Phone</label><input id="reg-phone" placeholder="0300-0000000"></div>
      <div class="fg full"><label>Address</label><input id="reg-address" placeholder="Full home address"></div>
      <div class="fg full">
        <button class="btn btn-p btn-full" onclick="saveNewPatient('${newId}')">🏥 Register Patient &amp; Generate ID</button>
      </div>
    </div>
  </div>`;
}

function saveNewPatient(newId) {
  const name    = document.getElementById('reg-name').value.trim();
  const age     = document.getElementById('reg-age').value.trim();
  const gender  = document.getElementById('reg-gender').value;
  const blood   = document.getElementById('reg-blood').value;
  const phone   = document.getElementById('reg-phone').value.trim();
  const address = document.getElementById('reg-address').value.trim();

  if (!name || !age || !gender) {
    document.getElementById('reg-alert').innerHTML =
      `<div class="alert a-err">❌ Please fill in Name, Age, and Gender.</div>`;
    return;
  }

  const patients = getPatients();
  patients.push({
    id: newId, name, age: parseInt(age), gender,
    phone: phone || 'N/A', blood: blood || 'N/A',
    address: address || 'N/A',
    joined: new Date().toISOString().split('T')[0]
  });
  savePatients(patients);

  document.getElementById('reg-alert').innerHTML =
    `<div class="alert a-ok">✅ Patient <strong>${name}</strong> registered successfully! ID: <strong>${newId}</strong></div>`;

  // Clear form and refresh ID
  setTimeout(() => loadPage('register'), 1800);
}

function copyId() {
  const id = document.getElementById('gen-id')?.textContent;
  if (id) navigator.clipboard.writeText(id).catch(()=>{}).then(()=> alert('Copied: ' + id));
}

// ══════════════════════════════════════════════
//  PAGE: SEARCH PATIENT
// ══════════════════════════════════════════════
function renderSearch() {
  return `
  <div class="card">
    <div class="search-row">
      <input class="search-inp" id="search-id" placeholder="Enter Patient ID — e.g. MC-2024-001"
             onkeydown="if(event.key==='Enter')doSearch()" style="text-transform:uppercase;">
      <button class="btn btn-p" onclick="doSearch()">🔍 Search</button>
    </div>
    <div id="search-alert"></div>
  </div>
  <div id="search-result"></div>`;
}

function searchFor(pid) {
  loadPage('search');
  setTimeout(() => {
    document.getElementById('search-id').value = pid;
    doSearch();
  }, 30);
}

function doSearch() {
  const pid = document.getElementById('search-id').value.trim().toUpperCase();
  const alertEl  = document.getElementById('search-alert');
  const resultEl = document.getElementById('search-result');

  if (!pid) { alertEl.innerHTML = `<div class="alert a-err">❌ Please enter a Patient ID.</div>`; return; }

  const patient = getPatientById(pid);
  if (!patient) {
    alertEl.innerHTML = `<div class="alert a-err">❌ No patient found with ID: <strong>${pid}</strong></div>`;
    resultEl.innerHTML = '';
    return;
  }

  alertEl.innerHTML = '';
  const canAdd = ['admin','doctor'].includes(currentUser.role);
  renderProfileInto('search-result', pid, canAdd);
}

// ══════════════════════════════════════════════
//  PAGE: MY RECORDS (Patient only)
// ══════════════════════════════════════════════
function renderMyRecords() {
  return `<div id="myrecords-profile"></div>`;
}

// ══════════════════════════════════════════════
//  SHARED: RENDER PATIENT PROFILE
// ══════════════════════════════════════════════
function renderProfileInto(containerId, pid, canAdd) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const patient = getPatientById(pid);
  if (!patient) { container.innerHTML = `<div class="alert a-err">❌ Patient not found.</div>`; return; }

  const records = getRecordsForPatient(pid);

  const recordCards = records.length === 0
    ? `<div class="empty"><div class="ei">📭</div><p>No visit records found yet.</p></div>`
    : records.map(r => `
        <div class="record">
          <div class="record-top">
            <div class="record-date">📅 ${r.date}</div>
            <div class="record-doc">👨‍⚕️ ${r.doctor}</div>
          </div>
          <div class="record-dx">🩺 ${r.diagnosis}</div>
          <div class="record-notes">${r.notes || '—'}</div>
          ${r.meds && r.meds.length ? `<div class="meds">${r.meds.map(m=>`<span class="med">💊 ${m}</span>`).join('')}</div>` : ''}
        </div>`).join('');

  container.innerHTML = `
    <div class="profile-banner">
      <div class="profile-avatar">${patient.name[0]}</div>
      <div style="flex:1;">
        <div class="profile-name">${patient.name}</div>
        <div class="profile-sub">Registered: ${patient.joined}</div>
        <div class="profile-tags">
          <span>🪪 ${patient.id}</span>
          <span>🎂 ${patient.age} yrs</span>
          <span>⚧ ${patient.gender}</span>
          <span>🩸 ${patient.blood}</span>
          <span>📞 ${patient.phone}</span>
        </div>
      </div>
      ${canAdd ? `<button class="btn btn-p btn-sm" onclick="openAddRecord('${patient.id}')">➕ Add Visit</button>` : ''}
    </div>
    <div style="font-size:15px;font-weight:700;color:#334155;margin-bottom:14px;">
      📋 Visit History (${records.length} record${records.length !== 1 ? 's' : ''})
    </div>
    ${recordCards}`;
}

// ══════════════════════════════════════════════
//  ADD RECORD MODAL
// ══════════════════════════════════════════════
function openAddRecord(pid) {
  addRecordForPatientId = pid;
  const patient = getPatientById(pid);
  document.getElementById('modal-patient-info').innerHTML =
    `Adding record for: <strong>${patient?.name}</strong> (${pid})`;

  // Defaults
  document.getElementById('rec-date').value  = new Date().toISOString().split('T')[0];
  document.getElementById('rec-diag').value  = '';
  document.getElementById('rec-notes').value = '';
  document.getElementById('rec-meds').value  = '';
  document.getElementById('rec-doc').value   = currentUser.role === 'doctor' ? currentUser.name : '';
  document.getElementById('modal-err').style.display = 'none';

  document.getElementById('modal-record').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-record').classList.remove('open');
  addRecordForPatientId = null;
}

function saveRecord() {
  const date  = document.getElementById('rec-date').value;
  const diag  = document.getElementById('rec-diag').value.trim();
  const notes = document.getElementById('rec-notes').value.trim();
  const meds  = document.getElementById('rec-meds').value
    .split(',').map(m => m.trim()).filter(Boolean);
  const doctor = document.getElementById('rec-doc').value.trim();

  const errEl = document.getElementById('modal-err');
  if (!date || !diag || !doctor) {
    errEl.textContent = '❌ Please fill in Date, Diagnosis, and Doctor Name.';
    errEl.style.display = 'block';
    return;
  }

  // Save to localStorage
  const records = getRecords();
  records.push({
    id: generateRecordId(),
    patientId: addRecordForPatientId,
    date, diagnosis: diag, notes, meds, doctor
  });
  saveRecords(records);

  closeModal();

  // Refresh current view
  const pid = addRecordForPatientId;
  if (document.getElementById('search-result')) {
    renderProfileInto('search-result', pid, true);
  }
  if (document.getElementById('myrecords-profile')) {
    renderProfileInto('myrecords-profile', pid, false);
  }
}

// ══════════════════════════════════════════════
//  CLOSE MODAL ON BACKGROUND CLICK
// ══════════════════════════════════════════════
document.getElementById('modal-record').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// ══════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════
initDB();
