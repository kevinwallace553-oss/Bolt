/* ═══════════════════════════════════════════════════
   BOLT KIOSK PWA — Main App Logic v2
═══════════════════════════════════════════════════ */

/* ── SESSION ── */
const SESSION = { token:'', name:'', role:'', username:'' };
let _allStudents = [];
let _checkedToday = new Set();   // Set of student IDs checked in today
let _checkinsToday = [];          // Full checkin objects for dashboard
let _leaders = [];
let _kLeader = '';
let _kEvent = '';
let _selectedEvent = null;
let _drawerStudent = null;
let _batchSelected = new Set();
let _feedData = [];
let _feedTab = 'all';
let _dashTimer = null;
let _manageAll = [];

/* ── HELPERS: field mapping ── */
// Backend uses firstName/lastName/birthday/ecName/ecPhone
// We display as name/dob/emergencyContact for simplicity
function toDisplayStudent(s) {
  return {
    id: s.id,
    name: ((s.firstName||'') + ' ' + (s.lastName||'')).trim() || s.name || '',
    grade: s.grade || '',
    dob: s.birthday || s.dob || '',
    parent: s.ecName || s.parentName || s.parent || '',
    phone: s.ecPhone || s.parentPhone || s.studentPhone || s.phone || '',
    email: s.parentEmail || s.email || '',
    emergencyContact: s.emergencyContact || '',
    allergies: s.allergies || '',
    photoUrl: s.photoUrl || '',
    rowNumber: s.rowNumber,
    // keep originals
    firstName: s.firstName || '',
    lastName: s.lastName || '',
  };
}

function toBackendStudent(d) {
  // Split name into first/last
  const parts = (d.name||'').trim().split(/\s+/);
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  return {
    firstName, lastName,
    grade: d.grade || '',
    birthday: d.dob || '',
    ecName: d.parent || '',
    ecPhone: d.phone || '',
    parentEmail: d.email || '',
    emergencyContact: d.emergencyContact || '',
    allergies: d.allergies || 'None',
    photoUrl: d.photoUrl || '',
  };
}

/* ── VIEW ROUTER ── */
function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
  // Orientation fix
  applyOrientation();
  if (id === 'vDash') DASH.init();
}

/* ── ORIENTATION / RESPONSIVE ── */
function applyOrientation() {
  const isLandscape = window.innerWidth > window.innerHeight && window.innerWidth >= 700;
  document.body.classList.toggle('landscape', isLandscape);
  document.body.classList.toggle('portrait', !isLandscape);
}
applyOrientation();
window.addEventListener('resize', applyOrientation);
window.addEventListener('orientationchange', () => setTimeout(applyOrientation, 200));

/* ── CLOCK ── */
function tick() {
  const d = new Date(), h = d.getHours()%12||12,
        m = String(d.getMinutes()).padStart(2,'0'),
        ap = d.getHours()<12?'AM':'PM';
  const el = document.getElementById('homeClock');
  if (el) el.textContent = `${h}:${m} ${ap}`;
}
tick(); setInterval(tick, 1000);

/* ── THEME ── */
function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  document.body.setAttribute('data-theme', t);
  localStorage.setItem('bolt_theme', t);
  document.querySelectorAll('.theme-swatch').forEach(s =>
    s.classList.toggle('active', s.dataset.theme === t)
  );
  closeThemePicker();
  toast('🎨 Theme applied', 'ok');
}
function openThemePicker() { document.getElementById('themePicker').classList.add('open'); }
function closeThemePicker() { document.getElementById('themePicker').classList.remove('open'); }
(function loadTheme() {
  const t = localStorage.getItem('bolt_theme') || '';
  document.documentElement.setAttribute('data-theme', t);
  document.body.setAttribute('data-theme', t);
  document.querySelectorAll('.theme-swatch').forEach(s =>
    s.classList.toggle('active', s.dataset.theme === t)
  );
})();

/* ── TOAST ── */
let _toastTimer;
function toast(msg, type='ok') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${type} show`;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

/* ── MODALS ── */
function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  // cmPrintModal uses inline display style, others use class
  if (id === 'cmPrintModal') { el.style.display = 'flex'; }
  else { el.classList.add('open'); }
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (id === 'cmPrintModal') { el.style.display = 'none'; }
  else { el.classList.remove('open'); }
}
function showSaving(label='Saving…') {
  document.getElementById('savLbl').textContent = label;
  document.getElementById('savOverlay').classList.add('on');
}
function hideSaving() { document.getElementById('savOverlay').classList.remove('on'); }

/* ── AVATAR ── */
function initials(name) {
  return (name||'?').split(' ').map(w=>w[0]||'').join('').toUpperCase().slice(0,2) || '?';
}
function gradientForName(name) {
  const h = [...(name||'')].reduce((a,c)=>a+c.charCodeAt(0),0);
  return `hsl(${h%360},45%,35%)`;
}

/* ── DRAWER ── */
function openDrawer(student) {
  _drawerStudent = student;
  const body = document.getElementById('drawerBody');
  const init = initials(student.name);
  const hasAllergy = student.allergies && student.allergies.toLowerCase() !== 'none' && student.allergies.trim();
  body.innerHTML = `
    <div class="d-av-wrap">
      ${student.photoUrl
        ? `<img src="${student.photoUrl}" style="width:72px;height:72px;border-radius:50%;object-fit:cover;border:3px solid var(--rim2)">`
        : `<div class="d-av-ph" style="background:${gradientForName(student.name)}">${init}</div>`}
    </div>
    <div class="d-name">${student.name}</div>
    <div class="d-grade">${student.grade ? 'Grade '+student.grade : 'Grade not set'}</div>
    <div class="d-sec">
      <div class="d-sec-lbl">Contact Info</div>
      <div class="d-field"><div class="d-field-lbl">Parent / Guardian</div><div class="d-field-val ${!student.parent?'empty':''}">${student.parent||'Not provided'}</div></div>
      <div class="d-field"><div class="d-field-lbl">Phone</div><div class="d-field-val ${!student.phone?'empty':''}">${student.phone?`<a href="tel:${student.phone}">${student.phone}</a>`:'Not provided'}</div></div>
      <div class="d-field"><div class="d-field-lbl">Email</div><div class="d-field-val ${!student.email?'empty':''}">${student.email?`<a href="mailto:${student.email}">${student.email}</a>`:'Not provided'}</div></div>
    </div>
    ${hasAllergy ? `<div class="d-sec ec"><div class="d-sec-lbl">⚠️ Allergies / Medical</div><div class="d-field-val">${student.allergies}</div></div>` : ''}
    <div class="d-sec">
      <div class="d-sec-lbl">Details</div>
      <div class="d-field"><div class="d-field-lbl">Date of Birth</div><div class="d-field-val ${!student.dob?'empty':''}">${student.dob||'Not set'}</div></div>
      <div class="d-field"><div class="d-field-lbl">Emergency Contact</div><div class="d-field-val ${!student.emergencyContact?'empty':''}">${student.emergencyContact||'Not provided'}</div></div>
      <div class="d-field"><div class="d-field-lbl">Student ID</div><div class="d-field-val" style="font-size:10px;color:var(--muted2)">${student.id||'—'}</div></div>
    </div>`;
  document.getElementById('drawerTitle').textContent = student.name;
  document.getElementById('drawerOverlay').classList.add('open');
  document.getElementById('studentDrawer').classList.add('open');
}
function closeDrawer() {
  document.getElementById('drawerOverlay').classList.remove('open');
  document.getElementById('studentDrawer').classList.remove('open');
}

/* ── INIT ── */
window.addEventListener('load', async () => {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
  setTimeout(() => showView('vAuth'), 500);
});

/* ── AUTH ── */
const AUTH = {
  tab(t) {
    ['login','register','forgot'].forEach(p => {
      document.getElementById(`p${p.charAt(0).toUpperCase()+p.slice(1)}`)
        ?.classList.toggle('active', p===t);
    });
    document.querySelectorAll('.auth-tab').forEach((b,i) =>
      b.classList.toggle('active',(i===0&&t==='login')||(i===1&&t==='register'))
    );
    this.clearMsgs();
  },
  clearMsgs() {
    document.querySelectorAll('.msg').forEach(m => { m.style.display='none'; m.textContent=''; });
  },
  showErr(id,msg) { const e=document.getElementById(id); if(e){e.textContent=msg;e.style.display='block';} },
  showOk(id,msg)  { const e=document.getElementById(id); if(e){e.textContent=msg;e.style.display='block';} },
  setLoading(on) {
    document.getElementById('authLoad').style.display = on?'block':'none';
    document.querySelector('.auth-pane.active')?.style && (document.querySelector('.auth-pane.active').style.opacity = on?'0.4':'1');
  },
  async login() {
    const u=document.getElementById('loginUser').value.trim();
    const p=document.getElementById('loginPass').value;
    this.clearMsgs();
    if(!u||!p){this.showErr('loginErr','Enter your username and password.');return;}
    this.setLoading(true);
    try {
      const r = await API.login(u,p);
      if(r?.success){
        SESSION.token=r.token; SESSION.name=r.name; SESSION.role=r.role; SESSION.username=r.username;
        const _first=(r.name||r.username||'').split(' ')[0];
        const _el=document.getElementById('homeName');if(_el)_el.textContent=_first?`${_first}`:'Youth Check-In System';
        const _gh=document.getElementById('homeGreeting');
        if(_gh){const hr=new Date().getHours();_gh.textContent=hr<12?'morning':hr<17?'afternoon':'evening';}
        showView('vHome');
      } else this.showErr('loginErr', r?.error||'Invalid username or password.');
    } catch(e) { this.showErr('loginErr','Connection error — check your internet.'); }
    this.setLoading(false);
  },
  async register() {
    const n=document.getElementById('regName').value.trim(),
          e=document.getElementById('regEmail').value.trim(),
          u=document.getElementById('regUser').value.trim(),
          p=document.getElementById('regPass').value;
    this.clearMsgs();
    if(!n||!e||!u||!p){this.showErr('regErr','All fields are required.');return;}
    this.setLoading(true);
    try {
      const r = await API.register(n,e,u,p);
      if(r?.success){this.showOk('regOk','Account created! Sign in now.');setTimeout(()=>this.tab('login'),1600);}
      else this.showErr('regErr',r?.error||'Registration failed.');
    } catch(e){this.showErr('regErr','Connection error.');}
    this.setLoading(false);
  },
  async forgot() {
    const email=document.getElementById('fgtEmail').value.trim();
    this.clearMsgs();
    if(!email){this.showErr('fgtErr','Enter your email.');return;}
    this.setLoading(true);
    try {
      const r = await API.forgotPassword(email);
      if(r?.success){this.showOk('fgtOk','Code sent!');document.getElementById('pReset').style.display='block';}
      else this.showErr('fgtErr',r?.error||'Email not found.');
    } catch(e){this.showErr('fgtErr','Connection error.');}
    this.setLoading(false);
  },
  async reset() {
    const email=document.getElementById('fgtEmail').value.trim(),
          code=document.getElementById('rstCode').value.trim(),
          pass=document.getElementById('rstPass').value;
    this.clearMsgs();
    if(!code||!pass){this.showErr('fgtErr','Enter the code and new password.');return;}
    this.setLoading(true);
    try {
      const r = await API.resetPassword(email,code,pass);
      if(r?.success){this.showOk('fgtOk','Password reset! Sign in now.');setTimeout(()=>this.tab('login'),1400);}
      else this.showErr('fgtErr',r?.error||'Reset failed.');
    } catch(e){this.showErr('fgtErr','Connection error.');}
    this.setLoading(false);
  }
};
document.addEventListener('keydown', e => {
  if(e.key!=='Enter') return;
  if(document.getElementById('vAuth').classList.contains('active')) {
    const pane = document.querySelector('.auth-pane.active');
    if(pane?.id==='pLogin') AUTH.login();
    else if(pane?.id==='pRegister') AUTH.register();
  }
});

/* ── SIGN OUT ── */
async function signOut() {
  const token = SESSION.token;
  Object.assign(SESSION,{token:'',name:'',role:'',username:''});
  _checkedToday.clear(); _allStudents=[]; _leaders=[];
  _kLeader=''; _kEvent=''; clearInterval(_dashTimer);
  try { if(token) await API.logout(token); } catch(e){}
  showView('vAuth'); AUTH.tab('login');
}

/* ════════════════════════════════════════════════════
   KIOSK
════════════════════════════════════════════════════ */
const KIOSK = {
  async init() {
    // Load leaders
    const sel = document.getElementById('leaderSelect');
    sel.innerHTML = '<option value="">Loading…</option>';
    try {
      const r = await API.getLeaders();
      _leaders = Array.isArray(r) ? r : (r?.leaders || []);
      if(!_leaders.length) {
        sel.innerHTML = '<option value="">No leaders — add one below</option>';
      } else {
        sel.innerHTML = '<option value="">— Select your name —</option>' +
          _leaders.map(l=>`<option value="${l}">${l}</option>`).join('');
      }
    } catch(e){ sel.innerHTML = '<option value="">Error loading leaders</option>'; }
    // Load students + checkins in parallel
    await Promise.all([this.loadAllStudents(), this.loadCheckins()]);
  },

  async loadAllStudents() {
    try {
      const r = await API.getAllStudents();
      // Backend returns array directly (not wrapped in {students:[]})
      const raw = Array.isArray(r) ? r : (r?.students || []);
      _allStudents = raw.map(toDisplayStudent);
      document.getElementById('kStatTotal').textContent = _allStudents.length;
    } catch(e){ console.error('loadAllStudents error',e); }
  },

  async loadCheckins() {
    try {
      const r = await API.getTodayCheckins();
      const cis = Array.isArray(r) ? r : (r?.checkins || []);
      _checkinsToday = cis;
      _checkedToday = new Set(
        cis.filter(c=>c.type!=='leader' && c.status!=='leader')
           .map(c=>String(c.studentId||c.id||''))
           .filter(Boolean)
      );
      document.getElementById('kStatChecked').textContent = _checkedToday.size;
    } catch(e){ console.error('loadCheckins error',e); }
  },

  async startSession() {
    const sel = document.getElementById('leaderSelect');
    if(!sel.value){toast('⚠️ Select your name first','err');return;}
    _kLeader = sel.value;
    document.getElementById('epGreeting').textContent = `Hey, ${_kLeader}!`;
    document.getElementById('leaderLogin').classList.add('gone');
    document.getElementById('eventPicker').classList.add('open');
  },

  selectEvent(el, name, icon, desc) {
    document.querySelectorAll('.ep-opt').forEach(o=>o.classList.remove('selected'));
    el.classList.add('selected');
    _selectedEvent = {name,icon,desc};
    document.getElementById('epOtherWrap').classList.toggle('show', name==='__other__');
  },

  confirmEvent() {
    if(!_selectedEvent){toast('⚠️ Pick an event type','err');return;}
    let eventName = _selectedEvent.name;
    if(eventName==='__other__'){
      eventName = document.getElementById('epOtherInput').value.trim();
      if(!eventName){toast('⚠️ Enter event name','err');return;}
    }
    _kEvent = eventName;
    document.getElementById('eventPicker').classList.remove('open');
    document.getElementById('kLeaderName').textContent = _kLeader;
    document.getElementById('kEventName').textContent = eventName;
    document.getElementById('kLeaderBox').classList.add('show');
    // Check leader in
    API.checkIn({type:'leader',leader:_kLeader}, {leader:_kLeader,event:eventName,type:'leader'}).catch(()=>{});
    toast(`⚡ Session started — ${eventName}`,'ok');
  },

  search(q) {
    document.getElementById('kClear').classList.toggle('show', q.length>0);
    if(!q.trim()){
      document.getElementById('kResults').innerHTML = `<div class="k-empty"><div class="k-empty-icon">🔍</div><div class="k-empty-title">Search for a student</div><div class="k-empty-sub">Type a name to find and check in</div></div>`;
      return;
    }
    const ql = q.toLowerCase();
    const results = _allStudents.filter(s=>(s.name||'').toLowerCase().includes(ql));
    this.renderResults(results);
  },

  renderResults(students) {
    const el = document.getElementById('kResults');
    if(!students.length){
      el.innerHTML=`<div class="k-empty"><div class="k-empty-icon">😕</div><div class="k-empty-title">No students found</div><div class="k-empty-sub">Try a different name or add a new student</div></div>`;
      return;
    }
    const today = new Date();
    el.innerHTML = students.map((s,i)=>{
      const checked = _checkedToday.has(String(s.id));
      // Birthday check — handle various date formats
      let isBday = false;
      if(s.dob){
        try{
          const parts = s.dob.match(/(\w+)\s+(\d+),?\s+(\d+)/); // "Jan 15, 2010"
          if(parts){
            const d = new Date(s.dob);
            isBday = d.getMonth()===today.getMonth() && d.getDate()===today.getDate();
          }
        }catch(e){}
      }
      const hasAllergy = s.allergies && s.allergies.toLowerCase()!=='none' && s.allergies.trim();
      const init = initials(s.name);
      return `<div class="s-card${checked?' checked':''}" style="animation-delay:${Math.min(i,8)*0.04}s"
        onclick="${checked?`KIOSK.showAlready('${s.name.replace(/'/,"\\'")}')`:`KIOSK.checkIn('${s.id}','${s.name.replace(/'/,"\\'")}')`}">
        <div class="s-av-ph" style="background:${gradientForName(s.name)}">${init}</div>
        <div class="s-info">
          <div class="s-name">${s.name}</div>
          <div class="s-badges">
            ${s.grade?`<span class="s-badge grade">Gr ${s.grade}</span>`:''}
            ${isBday?`<span class="s-badge bday">🎂 Birthday!</span>`:''}
            ${hasAllergy?`<span class="s-badge allergy">⚠️ Allergy</span>`:''}
            ${checked?`<span class="s-badge ec">✅ Checked In</span>`:''}
          </div>
        </div>
        ${checked?'<div class="s-check">✓</div>':`<div class="s-arrow" onclick="event.stopPropagation();KIOSK.openDrawerById('${s.id}')">›</div>`}
      </div>`;
    }).join('');
  },

  async checkIn(studentId, name) {
    if(!_kLeader){toast('⚠️ Start your session first','err');return;}
    const sid = String(studentId);
    const student = _allStudents.find(s=>String(s.id)===sid);
    if(!student) return;
    if(_checkedToday.has(sid)){this.showAlready(name);return;}
    // Optimistic
    _checkedToday.add(sid);
    document.getElementById('kStatChecked').textContent = _checkedToday.size;
    this.search(document.getElementById('kSearch').value);
    this.showSuccess(name, student.grade?`Grade ${student.grade}`:'Checked in!', student);
    try {
      const r = await API.checkIn(
        {id:student.id, firstName:student.firstName, lastName:student.lastName,
         fullName:student.name, grade:student.grade, photoUrl:student.photoUrl},
        {leader:_kLeader, event:_kEvent}
      );
      if(!r?.success && r?.status!=='success'){
        _checkedToday.delete(sid);
        document.getElementById('kStatChecked').textContent = _checkedToday.size;
        toast('⚠️ Check-in failed — try again','err');
        this.search(document.getElementById('kSearch').value);
      }
    } catch(e){
      _checkedToday.delete(sid);
      document.getElementById('kStatChecked').textContent = _checkedToday.size;
      toast('⚠️ Connection error','err');
      this.search(document.getElementById('kSearch').value);
    }
  },

  showSuccess(name, sub, student) {
    const today = new Date();
    let isBday = false;
    if(student?.dob){ try{ const d=new Date(student.dob); isBday=d.getMonth()===today.getMonth()&&d.getDate()===today.getDate(); }catch(e){} }
    document.getElementById('sucIcon').textContent = isBday?'🎂':'✅';
    document.getElementById('sucName').textContent = name;
    document.getElementById('sucMsg').textContent = isBday?`Happy Birthday, ${name.split(' ')[0]}! 🎉`:sub;
    const wrap = document.getElementById('confettiWrap');
    const colors = ['#0d9488','#06b6d4','#67e8f9','#a5f3fc','#fff','#fcd34d'];
    wrap.innerHTML = Array.from({length:22}).map((_,i)=>
      `<div class="cf" style="left:${Math.random()*100}%;top:${Math.random()*30-10}%;width:${4+Math.random()*6}px;height:${4+Math.random()*6}px;background:${colors[i%colors.length]};animation-delay:${Math.random()*0.4}s;animation-duration:${1.4+Math.random()*0.8}s"></div>`
    ).join('');
    document.getElementById('sucOverlay').classList.add('show');
    setTimeout(()=>document.getElementById('sucOverlay').classList.remove('show'), 2200);
  },

  showAlready(name) {
    document.getElementById('alreadyName').textContent = name;
    document.getElementById('alreadyOverlay').classList.add('show');
    setTimeout(()=>document.getElementById('alreadyOverlay').classList.remove('show'), 1800);
  },

  clearSearch() {
    document.getElementById('kSearch').value = '';
    document.getElementById('kClear').classList.remove('show');
    this.search('');
  },

  openDrawerById(id) {
    const s = _allStudents.find(s=>String(s.id)===String(id));
    if(s) openDrawer(s);
  },

  editFromDrawer() {
    if(!_drawerStudent) return;
    closeDrawer();
    this._fillEditForm(_drawerStudent);
    openModal('editStudentModal');
  },

  _fillEditForm(s) {
    document.getElementById('es_id').value = s.id||'';
    document.getElementById('es_name').value = s.name||'';
    document.getElementById('es_grade').value = s.grade||'';
    document.getElementById('es_dob').value = s.dob||'';
    document.getElementById('es_parent').value = s.parent||'';
    document.getElementById('es_phone').value = s.phone||'';
    document.getElementById('es_email').value = s.email||'';
    document.getElementById('es_ec').value = s.emergencyContact||'';
    document.getElementById('es_allergy').value = s.allergies||'';
  },

  async deleteFromDrawer() {
    if(!_drawerStudent) return;
    if(!confirm(`Delete ${_drawerStudent.name}? This cannot be undone.`)) return;
    closeDrawer();
    showSaving('Deleting…');
    try {
      await API.deleteStudent(_drawerStudent.id);
      _allStudents = _allStudents.filter(s=>String(s.id)!==String(_drawerStudent.id));
      this.clearSearch(); this.renderManage('');
      document.getElementById('kStatTotal').textContent = _allStudents.length;
      toast('🗑️ Student deleted','ok');
    } catch(e){ toast('⚠️ Delete failed','err'); }
    hideSaving();
  },

  openNewStudent() {
    // Clear form
    ['ns_name','ns_grade','ns_dob','ns_parent','ns_phone','ns_email','ns_ec','ns_allergy'].forEach(id=>{
      document.getElementById(id).value='';
    });
    document.getElementById('ns_checkin').checked = true;
    openModal('newStudentModal');
  },

  async saveNewStudent() {
    const name = document.getElementById('ns_name').value.trim();
    if(!name){toast('⚠️ Name is required','err');return;}
    const display = {
      name,
      grade: document.getElementById('ns_grade').value.trim(),
      dob: document.getElementById('ns_dob').value,
      parent: document.getElementById('ns_parent').value.trim(),
      phone: document.getElementById('ns_phone').value.trim(),
      email: document.getElementById('ns_email').value.trim(),
      emergencyContact: document.getElementById('ns_ec').value.trim(),
      allergies: document.getElementById('ns_allergy').value.trim() || 'None',
    };
    const backend = toBackendStudent(display);
    const ci = document.getElementById('ns_checkin').checked;
    const meta = ci && _kLeader ? {leader:_kLeader, event:_kEvent} : null;
    showSaving('Adding student…');
    try {
      const r = await API.addStudent(backend, meta);
      if(r?.status==='error'||r?.success===false){
        toast('⚠️ '+(r?.message||r?.error||'Failed to add student'),'err');
      } else {
        closeModal('newStudentModal');
        await this.loadAllStudents();
        if(ci && r?.id) _checkedToday.add(String(r.id));
        this.clearSearch();
        toast(`✅ ${name} added!`,'ok');
      }
    } catch(e){ toast('⚠️ Connection error','err'); }
    hideSaving();
  },

  async saveEditStudent() {
    const id = document.getElementById('es_id').value;
    const name = document.getElementById('es_name').value.trim();
    if(!name){toast('⚠️ Name is required','err');return;}
    const display = {
      name,
      grade: document.getElementById('es_grade').value.trim(),
      dob: document.getElementById('es_dob').value,
      parent: document.getElementById('es_parent').value.trim(),
      phone: document.getElementById('es_phone').value.trim(),
      email: document.getElementById('es_email').value.trim(),
      emergencyContact: document.getElementById('es_ec').value.trim(),
      allergies: document.getElementById('es_allergy').value.trim() || 'None',
    };
    const backend = toBackendStudent(display);
    showSaving('Saving changes…');
    try {
      const r = await API.editStudent(id, backend);
      if(r?.success){
        closeModal('editStudentModal');
        await this.loadAllStudents();
        this.clearSearch();
        toast('✅ Student updated','ok');
      } else toast('⚠️ '+(r?.error||'Failed to save'),'err');
    } catch(e){ toast('⚠️ Connection error','err'); }
    hideSaving();
  },

  openManage() {
    _manageAll = [..._allStudents];
    openModal('manageModal');
    this.renderManage('');
  },

  renderManage(q) {
    const students = q
      ? _manageAll.filter(s=>(s.name||'').toLowerCase().includes(q.toLowerCase()))
      : _manageAll;
    document.getElementById('manageCount').textContent = `${students.length} student${students.length!==1?'s':''}`;
    const list = document.getElementById('manageList');
    if(!students.length){
      list.innerHTML='<div class="empty-state"><p class="empty-txt">No students found</p></div>';
      return;
    }
    list.innerHTML = students.map(s=>{
      const init = initials(s.name);
      return `<div class="ms-row">
        <div class="ms-av" style="background:${gradientForName(s.name)}">${s.photoUrl?`<img src="${s.photoUrl}">`:`${init}`}</div>
        <div class="ms-info">
          <div class="ms-name">${s.name}</div>
          <div class="ms-meta">Grade ${s.grade||'—'} · ${s.parent||'No contact'}</div>
        </div>
        <div class="ms-acts">
          <button class="ms-edit" onclick="KIOSK.editById('${s.id}')">Edit</button>
          <button class="ms-del" onclick="KIOSK.deleteById('${s.id}','${s.name.replace(/'/,"\\'")}')" >Del</button>
        </div>
      </div>`;
    }).join('');
  },

  filterManage(q) { this.renderManage(q); },

  editById(id) {
    const s = _allStudents.find(s=>String(s.id)===String(id));
    if(!s) return;
    _drawerStudent = s;
    closeModal('manageModal');
    this._fillEditForm(s);
    openModal('editStudentModal');
  },

  async deleteById(id, name) {
    if(!confirm(`Delete ${name}? This cannot be undone.`)) return;
    showSaving('Deleting…');
    try {
      await API.deleteStudent(id);
      _allStudents = _allStudents.filter(s=>String(s.id)!==String(id));
      _manageAll = _manageAll.filter(s=>String(s.id)!==String(id));
      this.renderManage(document.getElementById('manageSearch').value||'');
      document.getElementById('kStatTotal').textContent = _allStudents.length;
      toast('🗑️ Student deleted','ok');
    } catch(e){ toast('⚠️ Delete failed','err'); }
    hideSaving();
  },

  async addLeaderPrompt() {
    const name = prompt('Enter new leader name:');
    if(!name?.trim()) return;
    showSaving('Adding leader…');
    try {
      const r = await API.addLeader(name.trim());
      if(r?.success){
        _leaders.push(name.trim());
        const sel = document.getElementById('leaderSelect');
        const opt = document.createElement('option');
        opt.value = name.trim(); opt.textContent = name.trim();
        sel.appendChild(opt);
        sel.value = name.trim();
        toast('✅ Leader added','ok');
      } else toast('⚠️ '+(r?.error||'Failed'),'err');
    } catch(e){ toast('⚠️ Connection error','err'); }
    hideSaving();
  },

  /* ── BATCH ── */
  openBatch() {
    if(!_allStudents.length){ toast('⚠️ No students loaded yet','err'); return; }
    _batchSelected.clear();
    this.updateBatchUI();
    document.getElementById('batchSearch').value = '';
    openModal('batchModal');
    this.renderBatch('');
  },

  renderBatch(q) {
    const students = q
      ? _allStudents.filter(s=>(s.name||'').toLowerCase().includes(q.toLowerCase()))
      : _allStudents;
    const el = document.getElementById('batchList');

    // Group: not-yet-checked, then already-checked
    const unchecked = students.filter(s=>!_checkedToday.has(String(s.id)));
    const checked   = students.filter(s=>_checkedToday.has(String(s.id)));

    let html = '';
    if(unchecked.length) html += `<div class="batch-sec-hdr">Not yet checked in (${unchecked.length})</div>`;
    html += unchecked.map(s=>{
      const init = initials(s.name);
      const sel = _batchSelected.has(String(s.id));
      return `<div class="batch-row${sel?' selected':''}" onclick="KIOSK.toggleBatch('${s.id}')" data-id="${s.id}">
        <div class="batch-av-ph" style="background:${gradientForName(s.name)}">${init}</div>
        <div class="batch-info"><div class="batch-name">${s.name}</div><div class="batch-meta">Grade ${s.grade||'—'}</div></div>
        <div class="batch-chk">${sel?'✓':''}</div>
      </div>`;
    }).join('');

    if(checked.length){
      html += `<div class="batch-sec-hdr" style="margin-top:8px">Already checked in (${checked.length})</div>`;
      html += checked.map(s=>{
        const init = initials(s.name);
        return `<div class="batch-row already" data-id="${s.id}">
          <div class="batch-av-ph" style="background:${gradientForName(s.name)}">${init}</div>
          <div class="batch-info"><div class="batch-name">${s.name}</div><div class="batch-meta">Grade ${s.grade||'—'} · Already in</div></div>
          <div class="batch-chk">✓</div>
        </div>`;
      }).join('');
    }

    el.innerHTML = html || '<div class="empty-state"><p class="empty-txt">No students found</p></div>';
  },

  toggleBatch(id) {
    const sid = String(id);
    if(_batchSelected.has(sid)) _batchSelected.delete(sid); else _batchSelected.add(sid);
    const row = document.querySelector(`[data-id="${sid}"]`);
    if(row){
      row.classList.toggle('selected', _batchSelected.has(sid));
      row.querySelector('.batch-chk').textContent = _batchSelected.has(sid)?'✓':'';
    }
    this.updateBatchUI();
  },

  updateBatchUI() {
    const n = _batchSelected.size;
    document.getElementById('batchPill').textContent = n;
    document.getElementById('batchGo').disabled = n===0;
    document.getElementById('batchSelLbl').textContent =
      n===0 ? 'Tap students to select' : `${n} student${n!==1?'s':''} selected`;
  },

  filterBatch(q) { this.renderBatch(q); },

  async submitBatch() {
    if(_batchSelected.size===0) return;
    if(!_kLeader){toast('⚠️ Start your session first (select a leader)','err');return;}
    const ids = [..._batchSelected];
    const students = ids.map(id=>_allStudents.find(s=>String(s.id)===id)).filter(Boolean);
    showSaving(`Checking in ${ids.length} students…`);
    try {
      const backendStudents = students.map(s=>({
        id:s.id, firstName:s.firstName, lastName:s.lastName,
        fullName:s.name, grade:s.grade, photoUrl:s.photoUrl
      }));
      await API.batchCheckIn(backendStudents, {leader:_kLeader, event:_kEvent});
      ids.forEach(id=>_checkedToday.add(id));
      _batchSelected.clear();
      closeModal('batchModal');
      document.getElementById('kStatChecked').textContent = _checkedToday.size;
      this.search(document.getElementById('kSearch').value);
      toast(`✅ ${ids.length} students checked in!`,'ok');
    } catch(e){ toast('⚠️ Batch check-in failed — check connection','err'); }
    hideSaving();
  }
};

/* ── KIOSK NAV ── */
function showKiosk() {
  showView('vKiosk');
  document.getElementById('leaderLogin').classList.remove('gone');
  document.getElementById('eventPicker').classList.remove('open');
  KIOSK.init();
}
function showDash() { showView('vDash'); }

/* ════════════════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════════════════ */
const DASH = {
  async init() {
    await this.refresh();
    clearInterval(_dashTimer);
    _dashTimer = setInterval(()=>this.refresh(), 30000);
  },

  async refresh() {
    showSaving('Refreshing…');
    try {
      const [dash, week, atRisk] = await Promise.all([
        API.getDashboard(),
        API.getWeeklyReport(0),
        API.getAtRisk()
      ]);
      this.renderStats(dash);
      this.renderFeed(dash?.checkins || _checkinsToday || []);
      this.renderBirthdays(dash?.birthdays || []);
      this.renderWeek(week);
      this.renderAtRisk(atRisk);
    } catch(e){ toast('⚠️ Refresh failed','err'); console.error(e); }
    hideSaving();
  },

  renderStats(data) {
    const set = (id,v) => { const el=document.getElementById(id); if(el) el.textContent=v??'—'; };
    set('dStatToday', data?.totalToday ?? data?.checkedIn ?? '—');
    set('dStatTodaySub', data?.event || 'Check-ins today');
    set('dStatTotal', data?.totalStudents ?? '—');
    set('dStatLeaders', data?.totalLeaders ?? data?.leadersToday ?? '—');
    set('dStatNew', data?.newToday ?? '—');
    set('dStatRisk', data?.atRisk ?? '—');
  },

  renderFeed(checkins) {
    _feedData = checkins || [];
    document.getElementById('feedCount').textContent = _feedData.length;
    this.filterFeed(document.getElementById('feedSearch')?.value||'');
  },

  feedTab(tab, btn) {
    _feedTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    this.filterFeed(document.getElementById('feedSearch')?.value||'');
  },

  filterFeed(q) {
    let data = [..._feedData];
    if(_feedTab==='students') data = data.filter(c=>c.type!=='leader'&&c.status!=='leader');
    else if(_feedTab==='leaders') data = data.filter(c=>c.type==='leader'||c.status==='leader');
    else if(_feedTab==='new') data = data.filter(c=>c.isNew||c.firstTime);
    if(q) data = data.filter(c=>(c.name||c.fullName||'').toLowerCase().includes(q.toLowerCase()));

    const el = document.getElementById('feedPanel');
    if(!data.length){
      el.innerHTML=`<div class="empty-state"><div class="empty-icon">📋</div><p class="empty-txt">No check-ins yet for today</p></div>`;
      return;
    }
    el.innerHTML = data.slice().reverse().map((c,i)=>{
      const name = c.name||c.fullName||'Unknown';
      const isLdr = c.type==='leader'||c.status==='leader';
      const time = c.time||c.checkInTime
        ? new Date(c.time||c.checkInTime).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})
        : '';
      const grade = c.grade;
      return `<div class="ci-row${isLdr?' ldr':''}" style="animation-delay:${Math.min(i,10)*0.035}s">
        <div class="ci-av-ph${isLdr?' ldr':''}" style="background:${gradientForName(name)}">${initials(name)}</div>
        <div class="ci-info">
          <div class="ci-name">${name}</div>
          <div class="ci-meta">
            ${isLdr?`<span class="ldr-tag">Leader</span>`:`${grade?`<span class="ci-grade-chip">Gr ${grade}</span> `:''}`}
            ${(c.isNew||c.firstTime)?`<span class="new-tag">NEW</span> `:''}
            ${c.event||c.sessionType||''}
          </div>
        </div>
        <div class="ci-time">${time}</div>
      </div>`;
    }).join('');
  },

  renderBirthdays(birthdays) {
    const scroll = document.getElementById('bdayScroll');
    document.getElementById('bdayCount').textContent = birthdays.length||'0';
    if(!birthdays.length){
      scroll.innerHTML='<div class="bday-empty">No birthdays this week 🎉</div>';
      return;
    }
    const today = new Date();
    scroll.innerHTML = birthdays.map(b=>{
      const name = b.name||b.firstName||'?';
      let isToday=false, diff=999;
      try{
        const dob = new Date(b.dob||b.birthday);
        const thisYear = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
        diff = Math.round((thisYear-today)/86400000);
        if(diff<0) diff += 365;
        isToday = diff===0;
      }catch(e){}
      const chipClass = isToday?'today':diff<=3?'soon':'upcoming';
      const chipLabel = isToday?'Today!':diff===1?'Tomorrow!':diff<=7?`In ${diff}d`:`In ${diff}d`;
      return `<div class="bday-card${isToday?' is-today':''}">
        <div class="bday-av-ph">${initials(name)}</div>
        <div class="bday-name">${name.split(' ')[0]}</div>
        <div class="bday-chip ${chipClass}">${chipLabel}</div>
      </div>`;
    }).join('');
  },

  renderWeek(data) {
    const el = document.getElementById('weekPanel');
    const days = data?.days || data?.weekly || data;
    if(!Array.isArray(days)||!days.length){
      el.innerHTML='<div class="empty-state"><p class="empty-txt">No weekly data available yet</p></div>';
      return;
    }
    const max = Math.max(...days.map(d=>+(d.count||d.total||0)),1);
    el.innerHTML = `<div style="padding:12px 10px;display:flex;flex-direction:column;gap:10px">${
      days.map(d=>{
        const count = d.count||d.total||0;
        const label = d.label||d.date||d.day||'';
        return `<div style="display:flex;align-items:center;gap:10px">
          <div style="font-size:10px;font-weight:700;color:var(--muted);width:72px;text-align:right;flex-shrink:0">${label}</div>
          <div style="flex:1;height:8px;background:var(--surface);border-radius:4px;overflow:hidden">
            <div style="height:100%;width:${(count/max*100).toFixed(1)}%;background:linear-gradient(90deg,var(--green),var(--teal));border-radius:4px;transition:width .6s .1s ease"></div>
          </div>
          <div style="font-family:var(--font);font-size:13px;font-weight:700;color:#67e8f9;min-width:24px;text-align:right">${count}</div>
        </div>`;
      }).join('')}
    </div>`;
  },

  renderAtRisk(data) {
    const el = document.getElementById('atRiskPanel');
    if(!el) return;
    const students = data?.twoWeeks||data?.atRisk||data||[];
    if(!students.length){
      el.innerHTML='<div class="empty-state"><div class="empty-icon">✅</div><p class="empty-txt">No at-risk students — great attendance!</p></div>';
      return;
    }
    document.getElementById('atRiskCount').textContent = students.length;
    el.innerHTML = students.slice(0,20).map(s=>{
      const name = s.name||((s.firstName||'')+' '+(s.lastName||'')).trim()||'Unknown';
      const pct = s.attendanceRate||s.rate||0;
      const weeks = s.weeksAbsent||s.missedWeeks||0;
      return `<div class="ci-row" style="cursor:default">
        <div class="ci-av-ph" style="background:rgba(239,68,68,0.3);color:#fca5a5">${initials(name)}</div>
        <div class="ci-info">
          <div class="ci-name">${name}</div>
          <div class="ci-meta">Grade ${s.grade||'—'} · ${weeks} weeks absent · ${pct}% attendance</div>
        </div>
        <div style="font-size:10px;font-weight:800;color:#fca5a5;flex-shrink:0;padding:3px 8px;background:rgba(239,68,68,.1);border-radius:100px;border:1px solid rgba(239,68,68,.25)">⚠️</div>
      </div>`;
    }).join('');
  }
};

/* ════════════════════════════════════════════════════
   DASH EXTENSIONS — navTab, analytics, at-risk,
   lookup, report
════════════════════════════════════════════════════ */

/* ── NAV TAB SWITCHING ── */
DASH.navTab = function(tab, btn) {
  // Switch nav buttons
  document.querySelectorAll('.dash-nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  // Switch tab panels
  document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
  const panel = document.getElementById(`dt${tab.charAt(0).toUpperCase()+tab.slice(1)}`);
  if (panel) panel.classList.add('active');

  // Load data for the tab being opened
  if (tab === 'analytics') DASH.loadAnalytics();
  if (tab === 'atrisk')    DASH.loadAtRisk();
  if (tab === 'lookup')    { /* ready on demand */ }
  if (tab === 'report')    DASH.loadReport(0);
};

/* ── ANALYTICS TAB ── */
DASH._weekOffset = 0;
DASH._analyticsLoaded = false;

DASH.loadAnalytics = async function() {
  if (DASH._analyticsLoaded) return;
  DASH._analyticsLoaded = true;
  DASH.loadWeek(0);
  DASH.loadTrend();
  DASH.loadGrades();
};

DASH.loadWeek = async function(offset) {
  DASH._weekOffset = offset;
  const el = document.getElementById('weekPanel');
  el.innerHTML = '<div class="empty-state"><p class="empty-txt">Loading…</p></div>';
  try {
    const r = await API.getWeeklyReport(offset);
    const days = r?.days || r?.weekly || (Array.isArray(r) ? r : []);
    if (!days.length) {
      el.innerHTML = '<div class="empty-state"><p class="empty-txt">No data for this week</p></div>';
      return;
    }
    const max = Math.max(...days.map(d => +(d.count||d.total||0)), 1);
    el.innerHTML = `<div style="padding:14px 12px;display:flex;flex-direction:column;gap:11px">${
      days.map(d => {
        const count = d.count||d.total||0;
        const label = d.label||d.date||d.day||'';
        const pct = (count/max*100).toFixed(1);
        return `<div style="display:flex;align-items:center;gap:10px">
          <div style="font-size:10px;font-weight:700;color:var(--muted);width:80px;flex-shrink:0;text-align:right">${label}</div>
          <div style="flex:1;height:10px;background:var(--surface);border-radius:5px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--green),var(--teal));border-radius:5px;transition:width .6s .1s ease"></div>
          </div>
          <div style="font-family:var(--font);font-size:14px;font-weight:800;color:#67e8f9;min-width:28px;text-align:right">${count}</div>
        </div>`;
      }).join('')
    }</div>`;
  } catch(e) {
    el.innerHTML = '<div class="empty-state"><p class="empty-txt">Failed to load — check connection</p></div>';
  }
};

DASH.loadTrend = async function() {
  const el = document.getElementById('trendPanel');
  if (!el) return;
  el.innerHTML = '<div class="empty-state"><p class="empty-txt">Loading…</p></div>';
  try {
    const r = await API.getAnalytics();
    const weeks = r?.weekly || r?.trend || [];
    if (!weeks.length) {
      el.innerHTML = '<div class="empty-state"><p class="empty-txt">Not enough data yet</p></div>';
      return;
    }
    const max = Math.max(...weeks.map(w => +(w.count||w.total||w.attended||0)), 1);
    el.innerHTML = `<div style="padding:14px 12px;display:flex;flex-direction:column;gap:8px">${
      weeks.map(w => {
        const count = w.count||w.total||w.attended||0;
        const label = w.label||w.week||w.date||'';
        return `<div style="display:flex;align-items:center;gap:10px">
          <div style="font-size:9px;font-weight:700;color:var(--muted);width:72px;flex-shrink:0;text-align:right">${label}</div>
          <div style="flex:1;height:8px;background:var(--surface);border-radius:4px;overflow:hidden">
            <div style="height:100%;width:${(count/max*100).toFixed(1)}%;background:linear-gradient(90deg,var(--teal),#7c3aed);border-radius:4px"></div>
          </div>
          <div style="font-family:var(--font);font-size:12px;font-weight:800;color:#a5f3fc;min-width:24px;text-align:right">${count}</div>
        </div>`;
      }).join('')
    }</div>`;
  } catch(e) {
    el.innerHTML = '<div class="empty-state"><p class="empty-txt">Failed to load analytics</p></div>';
  }
};

DASH.loadGrades = async function() {
  const el = document.getElementById('gradePanel');
  if (!el) return;
  el.innerHTML = '<div class="empty-state"><p class="empty-txt">Loading…</p></div>';
  try {
    const r = await API.getAnalytics();
    const grades = r?.gradeBreakdown || r?.grades || r?.monthly || [];
    if (!grades.length) {
      el.innerHTML = '<div class="empty-state"><p class="empty-txt">No grade data available</p></div>';
      return;
    }
    const max = Math.max(...grades.map(g => +(g.count||g.total||g.students||0)), 1);
    const colors = ['#0d9488','#06b6d4','#8b5cf6','#f59e0b','#ef4444','#10b981','#3b82f6'];
    el.innerHTML = `<div style="padding:14px 12px;display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px">${
      grades.map((g,i) => {
        const count = g.count||g.total||g.students||0;
        const label = g.grade!==undefined ? `Grade ${g.grade}` : (g.label||g.name||'?');
        const color = colors[i % colors.length];
        const pct = (count/max*100).toFixed(0);
        return `<div style="background:var(--ink2);border:1px solid var(--rim);border-radius:14px;padding:14px 12px;text-align:center;position:relative;overflow:hidden">
          <div style="position:absolute;bottom:0;left:0;right:0;height:${pct}%;background:${color};opacity:0.12;transition:height .6s ease"></div>
          <div style="font-family:var(--font);font-size:24px;font-weight:900;color:${color};line-height:1">${count}</div>
          <div style="font-size:10px;font-weight:700;color:var(--muted);margin-top:4px">${label}</div>
        </div>`;
      }).join('')
    }</div>`;
  } catch(e) {
    el.innerHTML = '<div class="empty-state"><p class="empty-txt">Failed to load grade data</p></div>';
  }
};

/* ── AT-RISK TAB ── */
DASH.loadAtRisk = async function() {
  const el = document.getElementById('atRiskList');
  if (!el) return;
  el.innerHTML = '<div class="empty-state" style="padding:40px"><div class="empty-icon">⏳</div><p class="empty-txt">Loading at-risk students…</p></div>';
  try {
    const r = await API.getAtRisk();
    const students = r?.twoWeeks || r?.atRisk || (Array.isArray(r) ? r : []);
    if (!students.length) {
      el.innerHTML = '<div class="empty-state" style="padding:40px"><div class="empty-icon">✅</div><p class="empty-txt">No at-risk students — great attendance!</p></div>';
      return;
    }
    el.innerHTML = `<div style="padding:16px;display:flex;flex-direction:column;gap:8px">${
      students.map(s => {
        const name = s.name || ((s.firstName||'')+' '+(s.lastName||'')).trim() || 'Unknown';
        const pct  = Math.round(+(s.attendanceRate||s.rate||0));
        const weeks = s.weeksAbsent||s.missedWeeks||s.missed||0;
        const grade = s.grade||'';
        const barColor = pct < 25 ? '#ef4444' : pct < 50 ? '#f59e0b' : '#0d9488';
        return `<div style="background:var(--ink2);border:1px solid rgba(239,68,68,.2);border-radius:16px;padding:14px 16px;display:flex;align-items:center;gap:12px">
          <div style="width:44px;height:44px;border-radius:50%;background:rgba(239,68,68,.15);display:flex;align-items:center;justify-content:center;font-family:var(--font);font-size:14px;font-weight:800;color:#fca5a5;flex-shrink:0">${initials(name)}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:14px;font-weight:700;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</div>
            <div style="font-size:10px;color:var(--muted);margin-bottom:6px;font-weight:500">${grade?`Grade ${grade} · `:''}${weeks} week${weeks!==1?'s':''} absent</div>
            <div style="height:5px;background:var(--surface);border-radius:3px;overflow:hidden">
              <div style="height:100%;width:${pct}%;background:${barColor};border-radius:3px;transition:width .6s ease"></div>
            </div>
          </div>
          <div style="font-family:var(--font);font-size:18px;font-weight:900;color:${barColor};flex-shrink:0;min-width:40px;text-align:right">${pct}%</div>
        </div>`;
      }).join('')
    }</div>`;
  } catch(e) {
    el.innerHTML = '<div class="empty-state" style="padding:40px"><p class="empty-txt">Failed to load — check connection</p></div>';
  }
};

/* ── LOOKUP TAB ── */
DASH._lookupResults = [];

DASH.lookupSearch = async function(q) {
  const el = document.getElementById('lookupResults');
  document.getElementById('lookupHistory').style.display = 'none';
  el.style.display = 'block';
  if (!q.trim()) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">🔎</div><p class="empty-txt">Search for a student to see their attendance history</p></div>';
    return;
  }
  const ql = q.toLowerCase();
  const matches = _allStudents.filter(s => (s.name||'').toLowerCase().includes(ql));
  DASH._lookupResults = matches;
  if (!matches.length) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">😕</div><p class="empty-txt">No students found matching that name</p></div>';
    return;
  }
  el.innerHTML = matches.slice(0,15).map(s =>
    `<div class="lookup-results-row" onclick="DASH.lookupOpen('${s.id}')">
      <div class="ci-av-ph" style="background:${gradientForName(s.name)}">${initials(s.name)}</div>
      <div class="ci-info">
        <div class="ci-name">${s.name}</div>
        <div class="ci-meta">Grade ${s.grade||'—'} · ${s.parent||'No contact on file'}</div>
      </div>
      <div style="font-size:14px;color:var(--muted2)">›</div>
    </div>`
  ).join('');
};

DASH.lookupOpen = async function(studentId) {
  const student = _allStudents.find(s => String(s.id) === String(studentId));
  if (!student) return;
  document.getElementById('lookupResults').style.display = 'none';
  const histEl = document.getElementById('lookupHistory');
  histEl.style.display = 'block';
  // Student card
  document.getElementById('lookupStudentCard').innerHTML = `
    <div class="lookup-av-ph" style="background:${gradientForName(student.name)}">${initials(student.name)}</div>
    <div>
      <div style="font-family:var(--font);font-size:18px;font-weight:800">${student.name}</div>
      <div style="font-size:12px;color:var(--muted);font-weight:500;margin-top:3px">Grade ${student.grade||'—'} · ${student.dob||'No DOB'}</div>
      <div style="font-size:12px;color:var(--muted2);margin-top:2px">${student.parent||''} ${student.phone?'· '+student.phone:''}</div>
    </div>`;
  // Load history
  const listEl = document.getElementById('lookupHistoryList');
  const cntEl  = document.getElementById('lookupCount');
  listEl.innerHTML = '<div class="empty-state"><p class="empty-txt">Loading history…</p></div>';
  try {
    const r = await API.getHistory(studentId, student.name);
    const history = Array.isArray(r) ? r : (r?.history || r?.checkins || []);
    cntEl.textContent = history.length + ' sessions';
    if (!history.length) {
      listEl.innerHTML = '<div class="empty-state"><p class="empty-txt">No attendance history found</p></div>';
      return;
    }
    listEl.innerHTML = history.slice().reverse().map(h => {
      const date  = h.date||h.sessionDate||'';
      const event = h.event||h.sessionType||h.type||'';
      const leader= h.leader||'';
      const fmt   = date ? new Date(date).toLocaleDateString([],{weekday:'short',month:'short',day:'numeric',year:'numeric'}) : date;
      return `<div class="ci-row" style="cursor:default">
        <div style="width:34px;height:34px;border-radius:50%;background:var(--soft);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">✅</div>
        <div class="ci-info">
          <div class="ci-name">${fmt||'Unknown date'}</div>
          <div class="ci-meta">${event} ${leader?'· '+leader:''}</div>
        </div>
      </div>`;
    }).join('');
  } catch(e) {
    listEl.innerHTML = '<div class="empty-state"><p class="empty-txt">Failed to load history</p></div>';
  }
};

DASH.lookupBack = function() {
  document.getElementById('lookupHistory').style.display = 'none';
  document.getElementById('lookupResults').style.display = 'block';
};

/* ── REPORT TAB ── */
DASH._reportOffset = 0;

DASH.loadReport = async function(offset) {
  DASH._reportOffset = offset;
  const el = document.getElementById('reportContent');
  const lbl = document.getElementById('reportWeekLabel');
  const nextBtn = document.getElementById('reportNextBtn');
  if(nextBtn) nextBtn.disabled = offset <= 0;
  el.innerHTML = '<div class="empty-state" style="padding:40px"><div class="empty-icon">⏳</div><p class="empty-txt">Loading report…</p></div>';
  try {
    const r = await API.getWeeklyReport(offset);
    const days  = r?.days || r?.weekly || (Array.isArray(r) ? r : []);
    const label = r?.weekLabel || r?.label || (offset===0 ? 'This Week' : `${offset} week${offset!==1?'s':''} ago`);
    if(lbl) lbl.textContent = label;
    const total = days.reduce((a,d)=>a+(d.count||d.total||0),0);
    const peak  = days.reduce((a,d)=>(d.count||d.total||0)>(a.count||a.total||0)?d:a, days[0]||{});
    const peakLabel = peak?.label||peak?.date||'—';
    const peakCount = peak?.count||peak?.total||0;
    el.innerHTML = `
      <div style="padding:16px;display:flex;flex-direction:column;gap:14px">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
          <div style="background:var(--ink2);border:1px solid var(--rim);border-radius:14px;padding:14px;text-align:center">
            <div style="font-family:var(--font);font-size:28px;font-weight:900;color:#67e8f9">${total}</div>
            <div style="font-size:10px;font-weight:700;color:var(--muted);margin-top:3px;text-transform:uppercase;letter-spacing:1px">Total</div>
          </div>
          <div style="background:var(--ink2);border:1px solid var(--rim);border-radius:14px;padding:14px;text-align:center">
            <div style="font-family:var(--font);font-size:28px;font-weight:900;color:#67e8f9">${days.filter(d=>(d.count||d.total||0)>0).length}</div>
            <div style="font-size:10px;font-weight:700;color:var(--muted);margin-top:3px;text-transform:uppercase;letter-spacing:1px">Active Days</div>
          </div>
          <div style="background:var(--ink2);border:1px solid var(--rim);border-radius:14px;padding:14px;text-align:center">
            <div style="font-family:var(--font);font-size:28px;font-weight:900;color:#67e8f9">${peakCount}</div>
            <div style="font-size:10px;font-weight:700;color:var(--muted);margin-top:3px;text-transform:uppercase;letter-spacing:1px">Peak Day</div>
          </div>
        </div>
        ${days.length ? `<div style="background:var(--ink2);border:1px solid var(--rim);border-radius:16px;padding:16px">
          <div style="font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:12px">Daily Breakdown</div>
          ${(() => {
            const max = Math.max(...days.map(d=>+(d.count||d.total||0)),1);
            return days.map(d=>{
              const count=d.count||d.total||0,label=d.label||d.date||'';
              const isPeak=label===peakLabel&&count===peakCount;
              return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
                <div style="font-size:10px;font-weight:700;color:var(--muted);width:80px;text-align:right;flex-shrink:0">${label}</div>
                <div style="flex:1;height:10px;background:var(--surface);border-radius:5px;overflow:hidden">
                  <div style="height:100%;width:${(count/max*100).toFixed(1)}%;background:${isPeak?'linear-gradient(90deg,#f59e0b,var(--teal))':'linear-gradient(90deg,var(--green),var(--teal))'};border-radius:5px;transition:width .6s ease"></div>
                </div>
                <div style="font-family:var(--font);font-size:13px;font-weight:800;color:${isPeak?'#fcd34d':'#67e8f9'};min-width:24px;text-align:right">${count}</div>
              </div>`;
            }).join('');
          })()}
        </div>` : ''}
        ${r?.topStudents||r?.students ? `<div style="background:var(--ink2);border:1px solid var(--rim);border-radius:16px;padding:16px">
          <div style="font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:12px">Top Attendees</div>
          ${(r.topStudents||r.students||[]).slice(0,10).map(s=>{
            const name=s.name||((s.firstName||'')+' '+(s.lastName||'')).trim()||'?';
            return `<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--rim)">
              <div style="width:28px;height:28px;border-radius:50%;background:var(--soft);display:flex;align-items:center;justify-content:center;font-family:var(--font);font-size:9px;font-weight:800;flex-shrink:0">${initials(name)}</div>
              <div style="flex:1;font-size:13px;font-weight:600">${name}</div>
              <div style="font-size:11px;font-weight:800;color:#67e8f9">${s.count||s.sessions||s.attended||1} session${(s.count||s.sessions||s.attended||1)!==1?'s':''}</div>
            </div>`;
          }).join('')}
        </div>` : ''}
      </div>`;
  } catch(e) {
    el.innerHTML = '<div class="empty-state" style="padding:40px"><p class="empty-txt">Failed to load report — check connection</p></div>';
  }
};

DASH.reportPrev = function() { DASH.loadReport(DASH._reportOffset + 1); };
DASH.reportNext = function() { if(DASH._reportOffset > 0) DASH.loadReport(DASH._reportOffset - 1); };

/* also update at-risk count on overview */
const _origRenderAtRisk = DASH.renderAtRisk.bind(DASH);
DASH.renderAtRisk = function(data) {
  _origRenderAtRisk(data);
  const cnt = document.getElementById('atRiskCount');
  if(cnt){
    const students = data?.twoWeeks||data?.atRisk||(Array.isArray(data)?data:[]);
    cnt.textContent = students.length||'0';
  }
};

/* ── REPORT DOWNLOAD ── */
DASH.downloadReport = async function() {
  showSaving('Preparing download…');
  try {
    const r = await API.getWeeklyReport(DASH._reportOffset);
    const days = r?.days || r?.weekly || (Array.isArray(r) ? r : []);
    const label = r?.weekLabel || r?.label ||
      (DASH._reportOffset === 0 ? 'This Week' : `${DASH._reportOffset} weeks ago`);
    const students = r?.topStudents || r?.students || [];

    // Build CSV
    const rows = [];
    rows.push(['Bolt Kiosk — Weekly Attendance Report']);
    rows.push([`Week: ${label}`]);
    rows.push([`Generated: ${new Date().toLocaleString()}`]);
    rows.push([]);

    // Summary
    const total = days.reduce((a,d) => a + (d.count||d.total||0), 0);
    const activeDays = days.filter(d => (d.count||d.total||0) > 0).length;
    rows.push(['Summary']);
    rows.push(['Total Check-Ins', total]);
    rows.push(['Active Days', activeDays]);
    rows.push([]);

    // Daily breakdown
    rows.push(['Daily Breakdown']);
    rows.push(['Day', 'Check-Ins']);
    days.forEach(d => rows.push([d.label||d.date||'', d.count||d.total||0]));
    rows.push([]);

    // Top attendees
    if (students.length) {
      rows.push(['Top Attendees']);
      rows.push(['Name', 'Grade', 'Sessions']);
      students.forEach(s => {
        const name = s.name || ((s.firstName||'')+' '+(s.lastName||'')).trim();
        rows.push([name, s.grade||'', s.count||s.sessions||s.attended||1]);
      });
    }

    // Convert to CSV string
    const csv = rows.map(row =>
      row.map(cell => {
        const str = String(cell ?? '');
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"` : str;
      }).join(',')
    ).join('\r\n');

    // Trigger download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `bolt-report-${label.replace(/\s+/g,'-').toLowerCase()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast('📥 Report downloaded!', 'ok');
  } catch(e) {
    toast('⚠️ Download failed — try again', 'err');
    console.error(e);
  }
  hideSaving();
};

/* ════════════════════════════════════════════════════
   CHILDREN'S MINISTRY (CM) MODULE
════════════════════════════════════════════════════ */
const CM = {
  _families: [],
  _filtered: [],
  _checkedFamilies: new Set(),
  _printFamily: null,

  /* ── OPEN FROM KIOSK ── */
  openKiosk() {
    showView('vCM');
    this.load();
  },

  /* ── LOAD ALL FAMILIES ── */
  async load() {
    try {
      showSaving('Loading families…');
      const r = await API.getFamilies();
      this._families = r?.families || [];
      this._filtered = [...this._families];
      this.updateStats();
      this.render(this._filtered);
    } catch(e) {
      toast('⚠️ Failed to load families', 'err');
    }
    hideSaving();
  },

  updateStats() {
    const totalChildren = this._families.reduce((a,f)=>a+f.children.length, 0);
    const el1 = document.getElementById('cmStatFamilies');
    const el2 = document.getElementById('cmStatChildren');
    if(el1) el1.textContent = this._families.length;
    if(el2) el2.textContent = totalChildren;
  },

  /* ── SEARCH ── */
  search(q) {
    document.getElementById('cmClear').classList.toggle('show', q.length>0);
    if (!q.trim()) {
      this._filtered = [...this._families];
    } else {
      const ql = q.toLowerCase().replace(/\D/g,'');
      const qt = q.toLowerCase();
      this._filtered = this._families.filter(f =>
        f.parentName.toLowerCase().includes(qt) ||
        f.phone.replace(/\D/g,'').includes(ql) ||
        f.email.toLowerCase().includes(qt) ||
        f.children.some(c => c.name.toLowerCase().includes(qt))
      );
    }
    this.render(this._filtered);
  },

  clearSearch() {
    document.getElementById('cmSearch').value = '';
    document.getElementById('cmClear').classList.remove('show');
    this._filtered = [...this._families];
    this.render(this._filtered);
  },

  /* ── RENDER FAMILY LIST ── */
  render(families) {
    const el = document.getElementById('cmFamilyList');
    if (!families.length) {
      el.innerHTML = `<div class="empty-state" style="padding:50px 20px">
        <div class="empty-icon">🔍</div>
        <div class="k-empty-title">${this._families.length ? 'No families match' : 'No families yet'}</div>
        <div class="k-empty-sub">${this._families.length ? 'Try a different search' : 'Tap "+ Family" to register your first family'}</div>
      </div>`;
      return;
    }

    el.innerHTML = families.map((f, fi) => {
      const isChecked = this._checkedFamilies.has(f.id);
      const init = initials(f.parentName);
      const allChecked = f.children.length > 0 && f.children.every(c => this._checkedFamilies.has(c.id));
      return `
      <div class="cm-family-card" style="background:var(--ink2);border:1px solid ${allChecked?'rgba(16,185,129,0.45)':'var(--rim)'};border-radius:20px;margin-bottom:10px;overflow:hidden;animation:fadeUp .25s ease both;animation-delay:${Math.min(fi,6)*0.05}s">
        <!-- Family header -->
        <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;cursor:pointer;border-bottom:1px solid var(--rim)" onclick="CM.toggleFamily('${f.id}')">
          <div style="width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,#10b981,#06b6d4);display:flex;align-items:center;justify-content:center;font-family:var(--font);font-size:16px;font-weight:800;flex-shrink:0;color:#fff">${init}</div>
          <div style="flex:1;min-width:0">
            <div style="font-family:var(--font);font-size:15px;font-weight:800;color:#fff">${f.parentName}</div>
            <div style="font-size:11px;color:var(--muted);margin-top:2px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              ${f.phone?`<span>📞 ${f.phone}</span>`:''}
              ${f.email?`<span>✉️ ${f.email}</span>`:''}
              <span style="color:#6ee7b7;font-weight:700">${f.children.length} child${f.children.length!==1?'ren':''}</span>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0">
            ${allChecked?'<div style="background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.4);border-radius:100px;padding:3px 10px;font-size:10px;font-weight:800;color:#6ee7b7">✅ All in</div>':''}
            <div style="font-size:18px;color:var(--muted2)" id="cmArrow_${f.id}">›</div>
          </div>
        </div>

        <!-- Children list (hidden by default) -->
        <div id="cmChildren_${f.id}" style="display:none">
          ${f.children.length === 0 ? `
          <div style="padding:14px 16px;text-align:center;color:var(--muted);font-size:12px">
            No children registered yet
          </div>` : f.children.map(ch => {
            const cChecked = this._checkedFamilies.has(ch.id);
            const hasAllergy = ch.allergies && ch.allergies.toLowerCase() !== 'none' && ch.allergies.trim();
            return `<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--rim);cursor:pointer;transition:background .15s;${cChecked?'background:rgba(16,185,129,0.06)':''}" onclick="CM.checkInChild('${ch.id}','${f.id}','${ch.name.replace(/'/,"\\'")}')">
              <div style="width:38px;height:38px;border-radius:50%;background:${gradientForName(ch.name)};display:flex;align-items:center;justify-content:center;font-family:var(--font);font-size:12px;font-weight:800;color:#fff;flex-shrink:0">${initials(ch.name)}</div>
              <div style="flex:1;min-width:0">
                <div style="font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px">
                  ${ch.name}
                  ${cChecked?'<span style="font-size:9px;font-weight:800;background:rgba(16,185,129,.15);color:#6ee7b7;padding:2px 7px;border-radius:100px;border:1px solid rgba(16,185,129,.3)">✅ In</span>':''}
                </div>
                <div style="font-size:10px;color:var(--muted);margin-top:2px;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                  ${ch.grade?`<span>Grade ${ch.grade}</span>`:''}
                  ${ch.room?`<span style="background:rgba(6,182,212,.1);color:#67e8f9;padding:1px 7px;border-radius:100px;border:1px solid rgba(6,182,212,.2);font-weight:700">${ch.room}</span>`:''}
                  ${hasAllergy?`<span style="background:rgba(249,115,22,.12);color:#fdba74;padding:1px 7px;border-radius:100px;border:1px solid rgba(249,115,22,.25);font-weight:700">⚠️ ${ch.allergies}</span>`:''}
                </div>
              </div>
              <div style="display:flex;gap:6px;flex-shrink:0" onclick="event.stopPropagation()">
                <button onclick="CM.editChild('${ch.id}','${f.id}')" style="width:28px;height:28px;border-radius:50%;background:var(--surface2);border:1px solid var(--rim);color:var(--muted);cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center">✏️</button>
                <button onclick="CM.deleteChildBtn('${ch.id}','${ch.name.replace(/'/,"\\'")}')" style="width:28px;height:28px;border-radius:50%;background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.2);color:#fca5a5;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center">🗑️</button>
              </div>
            </div>`;
          }).join('')}

          <!-- Family action bar -->
          <div style="display:flex;gap:8px;padding:10px 14px;background:rgba(6,14,16,0.5)">
            <button onclick="CM.checkInAll('${f.id}')" style="flex:1;padding:9px;border-radius:10px;background:rgba(16,185,129,.15);border:1px solid rgba(16,185,129,.35);color:#6ee7b7;font-family:var(--body);font-size:12px;font-weight:800;cursor:pointer">✅ Check In All</button>
            <button onclick="CM.openPrint('${f.id}')" style="flex:1;padding:9px;border-radius:10px;background:rgba(6,182,212,.1);border:1px solid rgba(6,182,212,.25);color:#67e8f9;font-family:var(--body);font-size:12px;font-weight:800;cursor:pointer">🏷️ Name Tags</button>
            <button onclick="CM.addChildToFamily('${f.id}')" style="padding:9px 13px;border-radius:10px;background:var(--surface2);border:1px solid var(--rim);color:var(--muted);font-family:var(--body);font-size:12px;font-weight:700;cursor:pointer">+ Child</button>
            <button onclick="CM.editFamily('${f.id}')" style="padding:9px 13px;border-radius:10px;background:var(--surface2);border:1px solid var(--rim);color:var(--muted);font-family:var(--body);font-size:12px;font-weight:700;cursor:pointer">✏️</button>
            <button onclick="CM.deleteFamilyBtn('${f.id}','${f.parentName.replace(/'/,"\\'")}')" style="padding:9px 11px;border-radius:10px;background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.2);color:#fca5a5;font-family:var(--body);font-size:12px;cursor:pointer">🗑️</button>
          </div>
        </div>
      </div>`;
    }).join('');
  },

  /* ── TOGGLE FAMILY EXPAND ── */
  toggleFamily(id) {
    const el    = document.getElementById(`cmChildren_${id}`);
    const arrow = document.getElementById(`cmArrow_${id}`);
    if (!el) return;
    const open = el.style.display === 'none';
    el.style.display   = open ? 'block' : 'none';
    if (arrow) arrow.textContent = open ? '⌄' : '›';
  },

  /* ── CHECK IN SINGLE CHILD ── */
  async checkInChild(childId, familyId, name) {
    if (this._checkedFamilies.has(childId)) {
      toast(`🔄 ${name} already checked in`, 'ok');
      return;
    }
    this._checkedFamilies.add(childId);
    const family = this._families.find(f => f.id === familyId);
    const child  = family?.children.find(c => c.id === childId);
    try {
      await API.checkIn(
        { id:childId, firstName:child?.firstName, lastName:child?.lastName,
          fullName:name, grade:child?.grade, type:'child',
          familyId, parentName:family?.parentName },
        { leader:_kLeader, event:_kEvent||"Children's Ministry" }
      );
      // Update checked count
      const el = document.getElementById('cmStatChecked');
      if (el) el.textContent = this._checkedFamilies.size;
      this.render(this._filtered);
      toast(`✅ ${name} checked in!`, 'ok');
    } catch(e) {
      this._checkedFamilies.delete(childId);
      toast('⚠️ Check-in failed', 'err');
    }
  },

  /* ── CHECK IN ALL CHILDREN IN FAMILY ── */
  async checkInAll(familyId) {
    const family = this._families.find(f => f.id === familyId);
    if (!family || !family.children.length) {
      toast('⚠️ No children in this family', 'err');
      return;
    }
    showSaving('Checking in family…');
    try {
      await API.checkInFamily(familyId, { leader:_kLeader, event:_kEvent||"Children's Ministry" });
      family.children.forEach(c => this._checkedFamilies.add(c.id));
      const el = document.getElementById('cmStatChecked');
      if (el) el.textContent = this._checkedFamilies.size;
      this.render(this._filtered);
      toast(`✅ ${family.parentName} family checked in!`, 'ok');
    } catch(e) {
      toast('⚠️ Check-in failed', 'err');
    }
    hideSaving();
  },

  /* ── ADD FAMILY ── */
  openAddFamily() {
    document.getElementById('cmf_id').value = '';
    document.getElementById('cmf_name').value = '';
    document.getElementById('cmf_phone').value = '';
    document.getElementById('cmf_email').value = '';
    document.getElementById('cmf_address').value = '';
    document.getElementById('cmf_notes').value = '';
    document.getElementById('cmFamilyModalTitle').textContent = '👨‍👩‍👧 Register Family';
    openModal('cmFamilyModal');
  },

  editFamily(familyId) {
    const f = this._families.find(f => f.id === familyId);
    if (!f) return;
    document.getElementById('cmf_id').value      = f.id;
    document.getElementById('cmf_name').value    = f.parentName;
    document.getElementById('cmf_phone').value   = f.phone;
    document.getElementById('cmf_email').value   = f.email;
    document.getElementById('cmf_address').value = f.address;
    document.getElementById('cmf_notes').value   = f.notes;
    document.getElementById('cmFamilyModalTitle').textContent = '✏️ Edit Family';
    openModal('cmFamilyModal');
  },

  async saveFamily() {
    const id   = document.getElementById('cmf_id').value;
    const name = document.getElementById('cmf_name').value.trim();
    const phone= document.getElementById('cmf_phone').value.trim();
    if (!name)  { toast('⚠️ Parent name is required', 'err'); return; }
    if (!phone) { toast('⚠️ Phone number is required', 'err'); return; }
    const data = { parentName:name, phone, email:document.getElementById('cmf_email').value.trim(),
      address:document.getElementById('cmf_address').value.trim(), notes:document.getElementById('cmf_notes').value.trim() };
    showSaving(id ? 'Updating family…' : 'Registering family…');
    try {
      let r;
      if (id) {
        r = await API.editFamily(id, data);
        if (r?.success) {
          const f = this._families.find(f => f.id === id);
          if (f) Object.assign(f, data);
        }
      } else {
        r = await API.addFamily(data);
        if (r?.success) {
          const newFam = { ...data, id:r.id, children:[] };
          this._families.unshift(newFam);
          this._filtered = [...this._families];
        }
      }
      if (r?.success) {
        closeModal('cmFamilyModal');
        this.updateStats();
        this.render(this._filtered);
        toast(id ? '✅ Family updated' : '✅ Family registered!', 'ok');
      } else toast('⚠️ '+(r?.error||'Failed'), 'err');
    } catch(e) { toast('⚠️ Connection error', 'err'); }
    hideSaving();
  },

  async deleteFamilyBtn(id, name) {
    if (!confirm(`Delete ${name}'s family and all their children? This cannot be undone.`)) return;
    showSaving('Deleting…');
    try {
      await API.deleteFamily(id);
      this._families = this._families.filter(f => f.id !== id);
      this._filtered = this._filtered.filter(f => f.id !== id);
      this.updateStats();
      this.render(this._filtered);
      toast('🗑️ Family deleted', 'ok');
    } catch(e) { toast('⚠️ Delete failed', 'err'); }
    hideSaving();
  },

  /* ── ADD / EDIT CHILD ── */
  addChildToFamily(familyId) {
    const family = this._families.find(f => f.id === familyId);
    document.getElementById('cmc_id').value       = '';
    document.getElementById('cmc_familyId').value = familyId;
    document.getElementById('cmc_familyBadge').textContent = `Family: ${family?.parentName || ''}`;
    ['cmc_first','cmc_last','cmc_grade','cmc_dob','cmc_room','cmc_allergy','cmc_notes'].forEach(id=>{ document.getElementById(id).value=''; });
    document.getElementById('cmChildModalTitle').textContent = '➕ Add Child';
    openModal('cmChildModal');
  },

  editChild(childId, familyId) {
    const family = this._families.find(f => f.id === familyId);
    const child  = family?.children.find(c => c.id === childId);
    if (!child) return;
    document.getElementById('cmc_id').value       = childId;
    document.getElementById('cmc_familyId').value = familyId;
    document.getElementById('cmc_familyBadge').textContent = `Family: ${family?.parentName || ''}`;
    document.getElementById('cmc_first').value   = child.firstName||'';
    document.getElementById('cmc_last').value    = child.lastName||'';
    document.getElementById('cmc_grade').value   = child.grade||'';
    document.getElementById('cmc_dob').value     = child.dob||'';
    document.getElementById('cmc_room').value    = child.room||'';
    document.getElementById('cmc_allergy').value = child.allergies||'';
    document.getElementById('cmc_notes').value   = child.notes||'';
    document.getElementById('cmChildModalTitle').textContent = '✏️ Edit Child';
    openModal('cmChildModal');
  },

  async saveChild() {
    const id       = document.getElementById('cmc_id').value;
    const familyId = document.getElementById('cmc_familyId').value;
    const first    = document.getElementById('cmc_first').value.trim();
    if (!first) { toast('⚠️ First name is required', 'err'); return; }
    const data = {
      familyId,
      firstName: first,
      lastName:  document.getElementById('cmc_last').value.trim(),
      grade:     document.getElementById('cmc_grade').value.trim(),
      dob:       document.getElementById('cmc_dob').value,
      room:      document.getElementById('cmc_room').value.trim(),
      allergies: document.getElementById('cmc_allergy').value.trim() || 'None',
      notes:     document.getElementById('cmc_notes').value.trim(),
    };
    showSaving(id ? 'Updating child…' : 'Adding child…');
    try {
      let r;
      if (id) {
        r = await API.editChild(id, data);
        if (r?.success) {
          const family = this._families.find(f => f.id === familyId);
          const child  = family?.children.find(c => c.id === id);
          if (child) {
            child.firstName = data.firstName; child.lastName = data.lastName;
            child.name = (data.firstName + ' ' + data.lastName).trim();
            child.grade = data.grade; child.dob = data.dob;
            child.room = data.room; child.allergies = data.allergies; child.notes = data.notes;
          }
        }
      } else {
        r = await API.addChild(data);
        if (r?.success) {
          const family = this._families.find(f => f.id === familyId);
          if (family) family.children.push({
            id: r.id, familyId,
            firstName: data.firstName, lastName: data.lastName,
            name: (data.firstName+' '+data.lastName).trim(),
            grade: data.grade, dob: data.dob,
            room: data.room, allergies: data.allergies, notes: data.notes,
            parentName: family.parentName
          });
        }
      }
      if (r?.success) {
        closeModal('cmChildModal');
        this.updateStats();
        this.render(this._filtered);
        // Keep family expanded
        setTimeout(() => {
          const el = document.getElementById(`cmChildren_${familyId}`);
          if (el) el.style.display = 'block';
        }, 50);
        toast(id ? '✅ Child updated' : '✅ Child added!', 'ok');
      } else toast('⚠️ '+(r?.error||'Failed'), 'err');
    } catch(e) { toast('⚠️ Connection error', 'err'); }
    hideSaving();
  },

  async deleteChildBtn(childId, name) {
    if (!confirm(`Remove ${name}? This cannot be undone.`)) return;
    showSaving('Removing…');
    try {
      await API.deleteChild(childId);
      this._families.forEach(f => { f.children = f.children.filter(c => c.id !== childId); });
      this._filtered = [...this._families];
      this.updateStats();
      this.render(this._filtered);
      toast('🗑️ Child removed', 'ok');
    } catch(e) { toast('⚠️ Delete failed', 'err'); }
    hideSaving();
  },

  /* ── NAME TAG PRINTING ── */
  openPrint(familyId) {
    const family = this._families.find(f => f.id === familyId);
    if (!family) return;
    this._printFamily = family;
    const preview = document.getElementById('cmTagPreview');
    preview.innerHTML = '';
    if (!family.children.length) {
      preview.innerHTML = '<div class="empty-state"><p class="empty-txt">No children in this family to print tags for</p></div>';
      openModal('cmPrintModal');
      return;
    }
    const today = new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
    const time  = new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
    const secCode = (Math.random().toString(36).substring(2,6)).toUpperCase();

    family.children.forEach(child => {
      const hasAllergy = child.allergies && child.allergies.toLowerCase() !== 'none' && child.allergies.trim();
      const grade = child.grade ? 'Grade ' + child.grade : '';
      const wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex;flex-direction:column;gap:10px;';

      // ── CHILD TAG preview ──────────────────────────────
      wrap.innerHTML = `
        <div style="width:240px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.13);font-family:Arial,sans-serif">
          <div style="height:9px;background:linear-gradient(90deg,#10b981,#06b6d4)"></div>
          <div style="padding:14px 16px 10px;text-align:center">
            <div style="font-size:8px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#10b981;margin-bottom:8px">CHILDREN'S MINISTRY</div>
            <div style="font-size:36px;font-weight:900;color:#111;line-height:1;margin-bottom:1px">${child.firstName}</div>
            <div style="font-size:16px;font-weight:700;color:#333;margin-bottom:8px">${child.lastName}</div>
            <div style="display:flex;gap:5px;justify-content:center;flex-wrap:wrap;margin-bottom:6px">
              ${child.room ? `<span style="font-size:10px;font-weight:800;padding:3px 10px;border-radius:100px;background:#ecfdf5;border:1.5px solid #10b981;color:#059669">${child.room}</span>` : ''}
              ${grade ? `<span style="font-size:10px;font-weight:800;padding:3px 10px;border-radius:100px;background:#eff6ff;border:1.5px solid #3b82f6;color:#1d4ed8">${grade}</span>` : ''}
            </div>
            ${hasAllergy ? `<div style="background:#fff5f5;border:1.5px solid #ef4444;border-radius:8px;padding:4px 10px;font-size:10px;font-weight:800;color:#dc2626;display:inline-block">⚠️ ${child.allergies}</div>` : ''}
          </div>
          <div style="height:1px;background:repeating-linear-gradient(90deg,#ddd 0,#ddd 6px,transparent 6px,transparent 12px);margin:0 14px"></div>
          <div style="padding:10px 16px 14px;text-align:center;background:#f9fafb">
            <div style="font-size:7px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;margin-bottom:6px">SCAN TO PAGE PARENT</div>
            <div style="width:72px;height:72px;background:linear-gradient(135deg,#064e3b,#0d9488);border-radius:10px;margin:0 auto 6px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:9px;font-weight:700;letter-spacing:1px">QR CODE</div>
            <div style="font-size:7px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;margin-bottom:4px">PICKUP CODE</div>
            <div style="font-size:26px;font-weight:900;color:#10b981;letter-spacing:5px;line-height:1;margin-bottom:4px">${secCode}</div>
            <div style="font-size:9px;color:#bbb">${today} &bull; ${time}</div>
          </div>
        </div>

        <div style="width:240px;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.1);border:2px dashed #10b981;font-family:Arial,sans-serif">
          <div style="height:6px;background:linear-gradient(90deg,#10b981,#06b6d4)"></div>
          <div style="padding:12px 14px">
            <div style="font-size:7px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;margin-bottom:9px">SECURITY PICKUP STUB</div>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:9px">
              <div style="flex:1;min-width:0">
                <div style="font-size:15px;font-weight:900;color:#111;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${child.firstName} ${child.lastName}</div>
                <div style="font-size:10px;color:#666;margin-top:2px">${[child.room,grade].filter(Boolean).join(' · ')}</div>
              </div>
              <div style="background:#064e3b;border-radius:10px;padding:7px 11px;text-align:center;flex-shrink:0">
                <div style="font-size:7px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,.7);margin-bottom:2px">CODE</div>
                <div style="font-size:18px;font-weight:900;color:#6ee7b7;letter-spacing:4px;line-height:1">${secCode}</div>
              </div>
            </div>
            <div style="background:#f0fdf4;border-radius:8px;padding:7px 10px;margin-bottom:7px">
              <div style="font-size:12px;font-weight:700;color:#065f46">👤 ${family.parentName}</div>
              <div style="font-size:11px;color:#047857;margin-top:2px">📞 ${family.phone}</div>
            </div>
            <div style="font-size:9px;color:#bbb;text-align:center">${today} &bull; ${time}</div>
          </div>
        </div>`;

      preview.appendChild(wrap);
    });
    openModal('cmPrintModal');
  },

  printTags() {
    const family = this._printFamily;
    if (!family || !family.children.length) return;
    const today = new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'});
    const time  = new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
    const secCode = (Math.random().toString(36).substring(2,6)).toUpperCase();

    // One PAGE per child — child tag on page 1, parent stub on page 2 (repeated per child)
    const pages = family.children.map((child, ci) => {
      const hasAllergy = child.allergies && child.allergies.toLowerCase()!=='none' && child.allergies.trim();
      const grade = child.grade ? 'Grade ' + child.grade : '';
      const qrId  = 'qr_' + ci;
      const qrData = 'BOLT:'
        + '\nChild: '  + child.firstName + ' ' + child.lastName
        + (child.room  ? '\nRoom: '  + child.room  : '')
        + (child.grade ? '\nGrade: ' + child.grade  : '')
        + '\nParent: ' + family.parentName
        + '\nPhone: '  + family.phone
        + '\nCode: '   + secCode
        + '\nDate: '   + today;

      return (
        // ── PAGE 1: CHILD TAG ──────────────────────────────────
        '<div class="page child-page">'
          + '<div class="page-label">Child Name Tag &mdash; ' + child.firstName + ' ' + child.lastName + '</div>'
          + '<div class="tag">'
            + '<div class="ts"></div>'
            + '<div class="tc">'
              + '<div class="tm">CHILDREN&#39;S MINISTRY</div>'
              + '<div class="tfn">' + child.firstName + '</div>'
              + '<div class="tln">' + child.lastName  + '</div>'
              + '<div class="tb">'
                + (child.room  ? '<span class="tbr">' + child.room  + '</span>' : '')
                + (grade       ? '<span class="tbg">' + grade       + '</span>' : '')
              + '</div>'
              + (hasAllergy ? '<div class="tal">&#9888; ' + child.allergies + '</div>' : '')
            + '</div>'
            + '<div class="tdiv"></div>'
            + '<div class="tp">'
              + '<div class="tpl">SCAN TO PAGE PARENT</div>'
              + '<div class="qr-wrap" id="' + qrId + '"></div>'
              + '<div class="tpl mt">PICKUP CODE</div>'
              + '<div class="tcode">' + secCode + '</div>'
              + '<div class="tdt">' + today + ' &bull; ' + time + '</div>'
            + '</div>'
          + '</div>'
        + '</div>'

        // ── PAGE 2: PARENT STUB ───────────────────────────────
        + '<div class="page parent-page">'
          + '<div class="page-label">Parent Pickup Stub &mdash; ' + child.firstName + ' ' + child.lastName + '</div>'
          + '<div class="stub">'
            + '<div class="sb-stripe"></div>'
            + '<div class="sb-body">'
              + '<div class="sb-header">SECURITY PICKUP STUB</div>'
              + '<div class="sb-row">'
                + '<div class="sb-child">'
                  + '<div class="sb-name">' + child.firstName + ' ' + child.lastName + '</div>'
                  + '<div class="sb-detail">' + [child.room, grade].filter(Boolean).join(' &bull; ') + '</div>'
                + '</div>'
                + '<div class="sb-code-box">'
                  + '<div class="sb-code-lbl">CODE</div>'
                  + '<div class="sb-code">' + secCode + '</div>'
                + '</div>'
              + '</div>'
              + '<div class="sb-parent">'
                + '<div class="sb-parent-name">&#128100; ' + family.parentName + '</div>'
                + '<div class="sb-parent-phone">&#128222; ' + family.phone + '</div>'
              + '</div>'
              + '<div class="sb-note">Present this stub at pickup. Staff will match the code on your child\'s name tag.</div>'
              + '<div class="sb-footer">' + today + ' &bull; ' + time + '</div>'
            + '</div>'
          + '</div>'
        + '</div>'

        + '|QR|' + qrId + '|' + JSON.stringify(qrData) + '|END|'
      );
    });

    // Strip QR metadata
    const qrMeta = [];
    const pagesHTML = pages.map(p => {
      const match = p.match(/\|QR\|([^|]+)\|(.+)\|END\|$/s);
      if (match) qrMeta.push({ id: match[1], data: JSON.parse(match[2]) });
      return p.replace(/\|QR\|.+\|END\|$/s, '');
    }).join('');

    const qrScript = qrMeta.map(q =>
      'new QRCode(document.getElementById(' + JSON.stringify(q.id) + '),'
      + '{text:' + JSON.stringify(q.data) + ',width:90,height:90,'
      + 'colorDark:"#064e3b",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.M});'
    ).join('');

    // Tag size: standard label size ~3.375" x 2.3125" → 324px x 222px at 96dpi
    // Both tags same physical size
    const TAG_W = '340px';
    const TAG_H = '220px';

    const css = [
      '*{box-sizing:border-box;margin:0;padding:0}',
      'html,body{width:100%;height:100%;background:#f5f5f5;font-family:Arial,sans-serif}',
      // Each page centres one tag — prints as its own sheet
      '.page{',
        'width:100%;min-height:100vh;',
        'display:flex;flex-direction:column;align-items:center;justify-content:center;',
        'page-break-after:always;',
        'padding:20px;',
      '}',
      '.page-label{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;',
        'color:#9ca3af;margin-bottom:14px;text-align:center}',
      // Child tag
      '.tag{width:' + TAG_W + ';background:#fff;border-radius:18px;overflow:hidden;',
        'box-shadow:0 6px 24px rgba(0,0,0,.14)}',
      '.ts{height:10px;background:linear-gradient(90deg,#10b981,#06b6d4)}',
      '.tc{padding:18px 20px 12px;text-align:center}',
      '.tm{font-size:8px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#10b981;margin-bottom:10px}',
      '.tfn{font-size:44px;font-weight:900;color:#111;line-height:1;margin-bottom:2px}',
      '.tln{font-size:20px;font-weight:700;color:#333;margin-bottom:10px}',
      '.tb{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:8px}',
      '.tbr{font-size:11px;font-weight:800;padding:3px 12px;border-radius:100px;',
        'background:#ecfdf5;border:1.5px solid #10b981;color:#059669}',
      '.tbg{font-size:11px;font-weight:800;padding:3px 12px;border-radius:100px;',
        'background:#eff6ff;border:1.5px solid #3b82f6;color:#1d4ed8}',
      '.tal{background:#fff5f5;border:1.5px solid #ef4444;border-radius:8px;',
        'padding:5px 12px;font-size:11px;font-weight:800;color:#dc2626;',
        'margin-top:4px;display:inline-block}',
      '.tdiv{height:1px;',
        'background:repeating-linear-gradient(90deg,#ddd 0,#ddd 6px,transparent 6px,transparent 12px);',
        'margin:0 16px}',
      '.tp{padding:12px 20px 16px;text-align:center;background:#f9fafb}',
      '.tpl{font-size:7px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;margin-bottom:4px}',
      '.mt{margin-top:6px}',
      '.qr-wrap{display:flex;justify-content:center;margin:6px 0}',
      '.tcode{font-size:32px;font-weight:900;color:#10b981;letter-spacing:6px;line-height:1;margin-bottom:4px}',
      '.tdt{font-size:9px;color:#bbb}',
      // Parent stub — same width as child tag
      '.stub{width:' + TAG_W + ';background:#fff;border-radius:18px;overflow:hidden;',
        'box-shadow:0 6px 24px rgba(0,0,0,.14);border:3px dashed #10b981}',
      '.sb-stripe{height:10px;background:linear-gradient(90deg,#10b981,#06b6d4)}',
      '.sb-body{padding:20px 22px}',
      '.sb-header{font-size:7px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;',
        'color:#9ca3af;margin-bottom:14px;text-align:center}',
      '.sb-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px}',
      '.sb-child{flex:1;min-width:0}',
      '.sb-name{font-size:22px;font-weight:900;color:#111;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.sb-detail{font-size:12px;color:#666;margin-top:3px}',
      '.sb-code-box{background:#064e3b;border-radius:12px;padding:10px 16px;text-align:center;flex-shrink:0}',
      '.sb-code-lbl{font-size:7px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;',
        'color:rgba(255,255,255,.7);margin-bottom:3px}',
      '.sb-code{font-size:26px;font-weight:900;color:#6ee7b7;letter-spacing:5px;line-height:1}',
      '.sb-parent{background:#f0fdf4;border-radius:10px;padding:10px 14px;margin-bottom:12px}',
      '.sb-parent-name{font-size:15px;font-weight:700;color:#065f46}',
      '.sb-parent-phone{font-size:13px;color:#047857;margin-top:3px}',
      '.sb-note{font-size:10px;color:#9ca3af;text-align:center;margin-bottom:8px;line-height:1.5;font-style:italic}',
      '.sb-footer{font-size:9px;color:#bbb;text-align:center}',
      // Print styles
      '@media print{',
        'html,body{background:#fff}',
        '.page{min-height:100vh;padding:30px;box-shadow:none}',
        '.page-label{display:none}',
        '.tag,.stub{box-shadow:none}',
        '.child-page .tag{border:1.5px solid #ddd}',
      '}',
    ].join('');

    const win = window.open('', '_blank', 'width=960,height=800');
    win.document.write(
      '<!DOCTYPE html><html><head>'
      + '<title>Name Tags \u2014 ' + family.parentName + ' Family</title>'
      + '<style>' + css + '</style>'
      + '<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>'
      + '</head><body>'
      + pagesHTML
      + '<script>'
      + 'window.addEventListener("load",function(){'
      + qrScript
      + 'setTimeout(function(){window.print();},900);'
      + '});'
      + '<\/script>'
      + '</body></html>'
    );
    win.document.close();
    closeModal('cmPrintModal');
    toast('🖨\ufe0f Printing \u2014 child tag then parent stub per child', 'ok');
  }
};

/* ── SHOW CM BUTTON WHEN CHILDREN'S MINISTRY SELECTED ── */
const _origConfirmEvent = KIOSK.confirmEvent.bind(KIOSK);
KIOSK.confirmEvent = function() {
  _origConfirmEvent();
  const isCM = _kEvent === "Children's Ministry";
  const btn = document.getElementById('cmKioskBtn');
  if (btn) btn.style.display = isCM ? 'flex' : 'none';
};CM.printAllTags = function() {
  const checked = this._families.filter(f=>f.children.some(ch=>this._checkedFamilies.has(ch.id)));
  if (!checked.length) { toast('⚠️ No checked-in children yet','err'); return; }
  const today = new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'});
  const time  = new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
  const tagsHTML = checked.flatMap(family =>
    family.children.filter(ch=>this._checkedFamilies.has(ch.id)).map(child => {
      const hasAllergy = child.allergies && child.allergies.toLowerCase()!=='none' && child.allergies.trim();
      return '<div class="tag">'
        + '<div class="ts"></div>'
        + '<div class="tc">'
        +   "<div class=\"tm\">CHILDRENS MINISTRY</div>"
        +   '<div class="tfn">'+child.firstName+'</div>'
        +   '<div class="tln">'+child.lastName+'</div>'
        +   '<div class="tb">'
        +   (child.room?'<span class="tbr">'+child.room+'</span>':'')
        +   (child.grade?'<span class="tbg">Grade '+child.grade+'</span>':'')
        +   '</div>'
        +   (hasAllergy?'<div class="tal">⚠️ '+child.allergies+'</div>':'')
        + '</div>'
        + '<div class="tdiv"></div>'
        + '<div class="tp">'
        +   '<div class="tpl">PARENT / GUARDIAN</div>'
        +   '<div class="tpn">'+family.parentName+'</div>'
        +   '<div class="tph">'+family.phone+'</div>'
        +   '<div class="tdt">'+today+' · '+time+'</div>'
        + '</div>'
        + '</div>';
    })
  ).join('');
  const css='*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;background:#f0f0f0;padding:20px}h2{text-align:center;font-size:14px;color:#444;margin-bottom:20px}.grid{display:flex;flex-wrap:wrap;gap:16px;justify-content:center}.tag{width:260px;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.12);page-break-inside:avoid}.ts{height:10px;background:linear-gradient(90deg,#10b981,#06b6d4)}.tc{padding:18px 20px 14px;text-align:center}.tm{font-size:8px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#10b981;margin-bottom:10px}.tfn{font-size:42px;font-weight:900;color:#111;line-height:1;margin-bottom:2px}.tln{font-size:18px;font-weight:700;color:#333;margin-bottom:10px}.tb{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:8px}.tbr{font-size:10px;font-weight:800;padding:3px 12px;border-radius:100px;background:#ecfdf5;border:1.5px solid #10b981;color:#059669}.tbg{font-size:10px;font-weight:800;padding:3px 12px;border-radius:100px;background:#eff6ff;border:1.5px solid #3b82f6;color:#1d4ed8}.tal{background:#fff5f5;border:1.5px solid #ef4444;border-radius:8px;padding:5px 12px;font-size:10px;font-weight:800;color:#dc2626;margin-top:4px;display:inline-block}.tdiv{height:1px;background:repeating-linear-gradient(90deg,#ddd 0,#ddd 6px,transparent 6px,transparent 12px);margin:0 16px}.tp{padding:12px 20px 16px;text-align:center;background:#fafafa}.tpl{font-size:7px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:#999;margin-bottom:5px}.tpn{font-size:16px;font-weight:700;color:#222;margin-bottom:2px}.tph{font-size:12px;color:#555;margin-bottom:5px}.tdt{font-size:9px;color:#bbb}@media print{body{background:#fff;padding:8px}h2{display:none}.grid{gap:10px}.tag{box-shadow:none;border:1px solid #ddd}}';
  const total=checked.reduce((a,f)=>a+f.children.filter(ch=>this._checkedFamilies.has(ch.id)).length,0);
  const win=window.open('','_blank','width=900,height=700');
  win.document.write('<!DOCTYPE html><html><head><title>Name Tags</title><style>'+css+'</style></head><body><h2>🧒 Childrens Ministry · '+total+' children · '+today+'</h2><div class="grid">'+tagsHTML+'</div><scr'+'ipt>window.onload=function(){window.print()}<'+'/scr'+'ipt></body></html>');
  win.document.close();
  toast('🖨️ Printing all name tags','ok');
};

function showCM() { showView('vCM'); CM.load(); }
KIOSK.selectCM = function(el) { KIOSK.selectEvent(el, "Childrens Ministry", '🧒', "Childrens church check-in"); };