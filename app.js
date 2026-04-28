/* ═══════════════════════════════════════════════════
   BOLT KIOSK PWA — Main App Logic
═══════════════════════════════════════════════════ */

/* ── SESSION ── */
const SESSION = { token:'', name:'', role:'', username:'' };
let _allStudents = [];
let _checkedToday = new Set();
let _leaders = [];
let _kLeader = '';
let _kEvent = '';
let _selectedEvent = null;
let _drawerStudent = null;
let _batchAll = [];
let _batchSelected = new Set();
let _feedData = [];
let _feedTab = 'all';
let _dashTimer = null;

/* ── VIEW ROUTER ── */
function showView(id) {
  document.querySelectorAll('.view').forEach(v => { v.classList.remove('active'); });
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
  if (id === 'vDash') DASH.init();
}

/* ── CLOCK ── */
function tick() {
  const d = new Date(), h = d.getHours()%12||12, m = String(d.getMinutes()).padStart(2,'0'), ap = d.getHours()<12?'AM':'PM';
  const el = document.getElementById('homeClock');
  if (el) el.textContent = `${h}:${m} ${ap}`;
}
tick(); setInterval(tick, 1000);

/* ── THEME ── */
function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('bolt_theme', t);
  document.querySelectorAll('.theme-swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.theme === t);
  });
  closeThemePicker();
  toast('🎨 Theme applied', 'ok');
}
function openThemePicker() { document.getElementById('themePicker').classList.add('open'); }
function closeThemePicker() { document.getElementById('themePicker').classList.remove('open'); }
(function loadTheme() {
  const t = localStorage.getItem('bolt_theme') || '';
  document.documentElement.setAttribute('data-theme', t);
  document.querySelectorAll('.theme-swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.theme === t);
  });
})();

/* ── TOAST ── */
let _toastTimer;
function toast(msg, type='ok') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${type} show`;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { el.classList.remove('show'); }, 2800);
}

/* ── MODALS ── */
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function showSaving(label='Saving…') { document.getElementById('savLbl').textContent = label; document.getElementById('savOverlay').classList.add('on'); }
function hideSaving() { document.getElementById('savOverlay').classList.remove('on'); }

/* ── DRAWER ── */
function openDrawer(student) {
  _drawerStudent = student;
  const body = document.getElementById('drawerBody');
  const init = student.name ? student.name.trim().split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : '?';
  let hasAllergy = student.allergies && student.allergies.toLowerCase() !== 'none' && student.allergies.trim() !== '';
  body.innerHTML = `
    <div class="d-av-wrap"><div class="d-av-ph">${init}</div></div>
    <div class="d-name">${student.name}</div>
    <div class="d-grade">${student.grade ? 'Grade ' + student.grade : 'Grade not set'}</div>
    <div class="d-sec">
      <div class="d-sec-lbl">Contact Info</div>
      <div class="d-field"><div class="d-field-lbl">Parent/Guardian</div><div class="d-field-val ${!student.parent?'empty':''}">${student.parent||'Not provided'}</div></div>
      <div class="d-field"><div class="d-field-lbl">Phone</div><div class="d-field-val ${!student.phone?'empty':''}">${student.phone ? `<a href="tel:${student.phone}">${student.phone}</a>` : 'Not provided'}</div></div>
      <div class="d-field"><div class="d-field-lbl">Email</div><div class="d-field-val ${!student.email?'empty':''}">${student.email ? `<a href="mailto:${student.email}">${student.email}</a>` : 'Not provided'}</div></div>
    </div>
    ${hasAllergy ? `<div class="d-sec ec"><div class="d-sec-lbl">⚠️ Allergies / Medical</div><div class="d-field-val">${student.allergies}</div></div>` : ''}
    <div class="d-sec">
      <div class="d-sec-lbl">Emergency Contact</div>
      <div class="d-field-val ${!student.emergencyContact?'empty':''}">${student.emergencyContact||'Not provided'}</div>
    </div>
    <div class="d-sec">
      <div class="d-sec-lbl">Details</div>
      <div class="d-field"><div class="d-field-lbl">Date of Birth</div><div class="d-field-val ${!student.dob?'empty':''}">${student.dob||'Not set'}</div></div>
      <div class="d-field"><div class="d-field-lbl">Student ID</div><div class="d-field-val" style="font-size:10px;color:var(--muted2)">${student.id||'—'}</div></div>
    </div>
  `;
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
  // Register SW
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
  // Show auth
  setTimeout(() => showView('vAuth'), 600);
});

/* ── AUTH ── */
const AUTH = {
  tab(t) {
    ['login','register','forgot'].forEach(p => {
      const el = document.getElementById(`p${p.charAt(0).toUpperCase()+p.slice(1)}`);
      if (el) el.classList.toggle('active', p === t);
    });
    document.querySelectorAll('.auth-tab').forEach((b,i) => {
      b.classList.toggle('active', (i===0&&t==='login')||(i===1&&t==='register'));
    });
    this.clearMsgs();
  },
  clearMsgs() {
    document.querySelectorAll('.msg').forEach(m => { m.style.display='none'; m.textContent=''; });
  },
  showErr(id, msg) { const e=document.getElementById(id); if(e){e.textContent=msg;e.style.display='block';} },
  showOk(id, msg) { const e=document.getElementById(id); if(e){e.textContent=msg;e.style.display='block';} },
  setLoading(on) {
    document.getElementById('authLoad').style.display = on ? 'block' : 'none';
    document.querySelectorAll('.auth-pane.active').forEach(p => p.style.opacity = on ? '0.4' : '1');
  },
  async login() {
    const u = document.getElementById('loginUser').value.trim();
    const p = document.getElementById('loginPass').value;
    this.clearMsgs();
    if (!u||!p) { this.showErr('loginErr','Enter your username and password.'); return; }
    this.setLoading(true);
    try {
      const r = await API.login(u, p);
      if (r?.success) {
        SESSION.token = r.token; SESSION.name = r.name; SESSION.role = r.role; SESSION.username = r.username;
        document.getElementById('homeName').textContent = 'Welcome, ' + (r.name?.split(' ')[0] || r.username) + '!';
        showView('vHome');
      } else {
        this.showErr('loginErr', r?.error || 'Invalid username or password.');
      }
    } catch(e) { this.showErr('loginErr','Connection error — please try again.'); }
    this.setLoading(false);
  },
  async register() {
    const n=document.getElementById('regName').value.trim(), e=document.getElementById('regEmail').value.trim(),
          u=document.getElementById('regUser').value.trim(), p=document.getElementById('regPass').value;
    this.clearMsgs();
    if(!n||!e||!u||!p){this.showErr('regErr','All fields are required.');return;}
    this.setLoading(true);
    try {
      const r = await API.register(n,e,u,p);
      if(r?.success){this.showOk('regOk','Account created! You can now sign in.');setTimeout(()=>this.tab('login'),1600);}
      else this.showErr('regErr', r?.error||'Registration failed.');
    } catch(e){this.showErr('regErr','Connection error.');}
    this.setLoading(false);
  },
  async forgot() {
    const email = document.getElementById('fgtEmail').value.trim();
    this.clearMsgs();
    if(!email){this.showErr('fgtErr','Enter your email.');return;}
    this.setLoading(true);
    try {
      const r = await API.forgotPassword(email);
      if(r?.success){this.showOk('fgtOk','Reset code sent to your email.');document.getElementById('pReset').style.display='block';}
      else this.showErr('fgtErr', r?.error||'Email not found.');
    } catch(e){this.showErr('fgtErr','Connection error.');}
    this.setLoading(false);
  },
  async reset() {
    const email=document.getElementById('fgtEmail').value.trim(), code=document.getElementById('rstCode').value.trim(), pass=document.getElementById('rstPass').value;
    this.clearMsgs();
    if(!code||!pass){this.showErr('fgtErr','Enter the code and new password.');return;}
    this.setLoading(true);
    try {
      const r = await API.resetPassword(email,code,pass);
      if(r?.success){this.showOk('fgtOk','Password reset! You can now sign in.');setTimeout(()=>this.tab('login'),1400);}
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
  Object.assign(SESSION, {token:'',name:'',role:'',username:''});
  _checkedToday.clear(); _allStudents = []; _leaders = [];
  _kLeader = ''; _kEvent = '';
  clearInterval(_dashTimer);
  if(token) { try { await API.logout(token); } catch(e){} }
  showView('vAuth');
  AUTH.tab('login');
}

/* ── KIOSK ── */
const KIOSK = {
  async init() {
    // Load leaders into select
    const sel = document.getElementById('leaderSelect');
    sel.innerHTML = '<option value="">Loading…</option>';
    try {
      const r = await API.getLeaders();
      _leaders = r?.leaders || r || [];
      if (_leaders.length === 0) {
        sel.innerHTML = '<option value="">No leaders yet — add one below</option>';
      } else {
        sel.innerHTML = '<option value="">— Select your name —</option>' +
          _leaders.map(l => `<option value="${l}">${l}</option>`).join('');
      }
    } catch(e) { sel.innerHTML = '<option value="">Error loading — try again</option>'; }
    // Load all students
    this.loadAllStudents();
    // Load today's checkins
    this.loadCheckins();
  },
  async loadAllStudents() {
    try {
      const r = await API.getAllStudents();
      _allStudents = r?.students || r || [];
      document.getElementById('kStatTotal').textContent = _allStudents.length;
    } catch(e) {}
  },
  async loadCheckins() {
    try {
      const r = await API.getTodayCheckins();
      const cis = r?.checkins || r || [];
      _checkedToday = new Set(cis.filter(c=>c.type!=='leader').map(c=>c.studentId));
      document.getElementById('kStatChecked').textContent = cis.filter(c=>c.type!=='leader').length;
    } catch(e) {}
  },
  async startSession() {
    const sel = document.getElementById('leaderSelect');
    if (!sel.value) { toast('⚠️ Please select your name first','err'); return; }
    _kLeader = sel.value;
    document.getElementById('epGreeting').textContent = `Hey, ${_kLeader}!`;
    document.getElementById('leaderLogin').classList.add('gone');
    document.getElementById('eventPicker').classList.add('open');
  },
  selectEvent(el, name, icon, desc) {
    document.querySelectorAll('.ep-opt').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    _selectedEvent = { name, icon, desc };
    document.getElementById('epOtherWrap').classList.toggle('show', name === '__other__');
  },
  confirmEvent() {
    if (!_selectedEvent) { toast('⚠️ Pick an event type','err'); return; }
    let eventName = _selectedEvent.name;
    if (eventName === '__other__') {
      eventName = document.getElementById('epOtherInput').value.trim();
      if (!eventName) { toast('⚠️ Enter event name','err'); return; }
    }
    _kEvent = eventName;
    document.getElementById('eventPicker').classList.remove('open');
    document.getElementById('kLeaderName').textContent = _kLeader;
    document.getElementById('kEventName').textContent = eventName;
    document.getElementById('kLeaderBox').classList.add('show');
    // Check in the leader
    API.checkIn(null, { type:'leader', leader:_kLeader, event:eventName }).catch(()=>{});
    toast(`⚡ Session started — ${eventName}`, 'ok');
  },
  search(q) {
    const clear = document.getElementById('kClear');
    clear.classList.toggle('show', q.length > 0);
    if (!q.trim()) {
      document.getElementById('kResults').innerHTML = `<div class="k-empty"><div class="k-empty-icon">🔍</div><div class="k-empty-title">Search for a student</div><div class="k-empty-sub">Type a name to find and check in students</div></div>`;
      return;
    }
    const results = _allStudents.filter(s => s.name?.toLowerCase().includes(q.toLowerCase()));
    this.renderResults(results);
  },
  renderResults(students) {
    const el = document.getElementById('kResults');
    if (!students.length) {
      el.innerHTML = `<div class="k-empty"><div class="k-empty-icon">😕</div><div class="k-empty-title">No students found</div><div class="k-empty-sub">Try a different search or add a new student</div></div>`;
      return;
    }
    const today = new Date();
    el.innerHTML = students.map((s,i) => {
      const init = (s.name||'?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
      const checked = _checkedToday.has(s.id);
      const dob = s.dob ? new Date(s.dob) : null;
      const isBday = dob && dob.getMonth()===today.getMonth() && dob.getDate()===today.getDate();
      const hasAllergy = s.allergies && s.allergies.toLowerCase()!=='none' && s.allergies.trim()!=='';
      return `<div class="s-card ${checked?'checked':''}" style="animation-delay:${i*0.04}s" onclick="${checked?`KIOSK.showAlready('${s.name.replace(/'/,"\\'")}')`:(`KIOSK.checkIn('${s.id}','${s.name.replace(/'/,"\\'")}')`)}">
        <div class="s-av-ph">${init}</div>
        <div class="s-info">
          <div class="s-name">${s.name}</div>
          <div class="s-badges">
            ${s.grade?`<span class="s-badge grade">Grade ${s.grade}</span>`:''}
            ${isBday?`<span class="s-badge bday">🎂 Birthday!</span>`:''}
            ${hasAllergy?`<span class="s-badge allergy">⚠️ ${s.allergies.substring(0,20)}</span>`:''}
            ${checked?`<span class="s-badge ec">✅ Checked In</span>`:''}
          </div>
        </div>
        ${checked?'<div class="s-check">✓</div>':'<div class="s-arrow" onclick="event.stopPropagation();KIOSK.openDrawerById(\''+s.id+'\')">›</div>'}
      </div>`;
    }).join('');
  },
  async checkIn(studentId, name) {
    if (!_kLeader) { toast('⚠️ Start your session first','err'); return; }
    const student = _allStudents.find(s => s.id === studentId);
    if (!student) return;
    if (_checkedToday.has(studentId)) { this.showAlready(name); return; }
    // Optimistic update
    _checkedToday.add(studentId);
    this.search(document.getElementById('kSearch').value);
    document.getElementById('kStatChecked').textContent = _checkedToday.size;
    this.showSuccess(name, student.grade ? `Grade ${student.grade}` : 'Checked in!', student);
    try {
      const r = await API.checkIn(studentId, { leader: _kLeader, event: _kEvent });
      if (!r?.success) { _checkedToday.delete(studentId); toast('⚠️ Check-in failed — try again','err'); this.search(document.getElementById('kSearch').value); }
    } catch(e) { _checkedToday.delete(studentId); toast('⚠️ Connection error','err'); this.search(document.getElementById('kSearch').value); }
  },
  showSuccess(name, sub, student) {
    const today = new Date();
    const dob = student?.dob ? new Date(student.dob) : null;
    const isBday = dob && dob.getMonth()===today.getMonth() && dob.getDate()===today.getDate();
    document.getElementById('sucIcon').textContent = isBday ? '🎂' : '✅';
    document.getElementById('sucName').textContent = name;
    document.getElementById('sucMsg').textContent = isBday ? `Happy Birthday, ${name.split(' ')[0]}! 🎉` : sub;
    document.getElementById('sucOverlay').classList.add('show');
    // Confetti
    const wrap = document.getElementById('confettiWrap');
    const colors = ['#0d9488','#06b6d4','#67e8f9','#a5f3fc','#fff'];
    wrap.innerHTML = Array.from({length:20}).map((_,i) => `<div class="cf" style="left:${Math.random()*100}%;top:${Math.random()*20}%;width:${4+Math.random()*6}px;height:${4+Math.random()*6}px;background:${colors[i%colors.length]};animation-delay:${Math.random()*0.5}s;animation-duration:${1.4+Math.random()*0.8}s"></div>`).join('');
    setTimeout(() => document.getElementById('sucOverlay').classList.remove('show'), 2000);
  },
  showAlready(name) {
    document.getElementById('alreadyName').textContent = name;
    document.getElementById('alreadyOverlay').classList.add('show');
    setTimeout(() => document.getElementById('alreadyOverlay').classList.remove('show'), 1800);
  },
  clearSearch() {
    document.getElementById('kSearch').value = '';
    document.getElementById('kClear').classList.remove('show');
    document.getElementById('kResults').innerHTML = `<div class="k-empty"><div class="k-empty-icon">🔍</div><div class="k-empty-title">Search for a student</div><div class="k-empty-sub">Type a name to find and check in students</div></div>`;
  },
  openDrawerById(id) {
    const s = _allStudents.find(s=>s.id===id);
    if(s) openDrawer(s);
  },
  editFromDrawer() {
    if(!_drawerStudent) return;
    closeDrawer();
    const s = _drawerStudent;
    document.getElementById('es_id').value = s.id;
    document.getElementById('es_name').value = s.name||'';
    document.getElementById('es_grade').value = s.grade||'';
    document.getElementById('es_dob').value = s.dob||'';
    document.getElementById('es_parent').value = s.parent||s.parentName||'';
    document.getElementById('es_phone').value = s.phone||s.parentPhone||'';
    document.getElementById('es_email').value = s.email||s.parentEmail||'';
    document.getElementById('es_ec').value = s.emergencyContact||'';
    document.getElementById('es_allergy').value = s.allergies||'';
    openModal('editStudentModal');
  },
  async deleteFromDrawer() {
    if(!_drawerStudent) return;
    if(!confirm(`Delete ${_drawerStudent.name}? This cannot be undone.`)) return;
    closeDrawer();
    showSaving('Deleting…');
    try {
      await API.deleteStudent(_drawerStudent.id);
      _allStudents = _allStudents.filter(s=>s.id!==_drawerStudent.id);
      this.clearSearch(); this.renderManage();
      toast('🗑️ Student deleted','ok');
    } catch(e) { toast('⚠️ Delete failed','err'); }
    hideSaving();
  },
  openNewStudent() { openModal('newStudentModal'); },
  async saveNewStudent() {
    const name = document.getElementById('ns_name').value.trim();
    if(!name){toast('⚠️ Name is required','err');return;}
    const data = { name, grade:document.getElementById('ns_grade').value.trim(), dob:document.getElementById('ns_dob').value, parentName:document.getElementById('ns_parent').value.trim(), parentPhone:document.getElementById('ns_phone').value.trim(), parentEmail:document.getElementById('ns_email').value.trim(), emergencyContact:document.getElementById('ns_ec').value.trim(), allergies:document.getElementById('ns_allergy').value.trim()||'None' };
    const ci = document.getElementById('ns_checkin').checked;
    showSaving('Adding student…');
    try {
      const r = await API.addStudent(data, ci && _kLeader ? { leader:_kLeader, event:_kEvent } : null);
      if(r?.success) {
        closeModal('newStudentModal');
        await this.loadAllStudents();
        if(ci && r.student?.id) _checkedToday.add(r.student.id);
        this.clearSearch();
        toast(`✅ ${name} added!`,'ok');
      } else toast('⚠️ '+(r?.error||'Failed to add student'),'err');
    } catch(e){ toast('⚠️ Connection error','err'); }
    hideSaving();
  },
  async saveEditStudent() {
    const id = document.getElementById('es_id').value;
    const name = document.getElementById('es_name').value.trim();
    if(!name){toast('⚠️ Name is required','err');return;}
    const data = { name, grade:document.getElementById('es_grade').value.trim(), dob:document.getElementById('es_dob').value, parentName:document.getElementById('es_parent').value.trim(), parentPhone:document.getElementById('es_phone').value.trim(), parentEmail:document.getElementById('es_email').value.trim(), emergencyContact:document.getElementById('es_ec').value.trim(), allergies:document.getElementById('es_allergy').value.trim()||'None' };
    showSaving('Saving changes…');
    try {
      const r = await API.editStudent(id, data);
      if(r?.success) {
        closeModal('editStudentModal');
        await this.loadAllStudents();
        this.clearSearch();
        toast('✅ Student updated','ok');
      } else toast('⚠️ '+(r?.error||'Failed'),'err');
    } catch(e){ toast('⚠️ Connection error','err'); }
    hideSaving();
  },
  openManage() {
    openModal('manageModal');
    this.renderManage();
  },
  renderManage(query='') {
    const list = document.getElementById('manageList');
    const students = query ? _allStudents.filter(s=>s.name?.toLowerCase().includes(query.toLowerCase())) : _allStudents;
    document.getElementById('manageCount').textContent = `${students.length} student${students.length!==1?'s':''}`;
    if(!students.length){list.innerHTML='<div class="empty-state"><p>No students found</p></div>';return;}
    list.innerHTML = students.map(s => {
      const init = (s.name||'?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
      return `<div class="ms-row">
        <div class="ms-av">${init}</div>
        <div class="ms-info"><div class="ms-name">${s.name}</div><div class="ms-meta">Grade ${s.grade||'—'} · ${s.parentName||s.parent||'No contact'}</div></div>
        <div class="ms-acts">
          <button class="ms-edit" onclick="KIOSK.editById('${s.id}')">Edit</button>
          <button class="ms-del" onclick="KIOSK.deleteById('${s.id}','${s.name.replace(/'/,"\\'")}')">Del</button>
        </div>
      </div>`;
    }).join('');
  },
  filterManage(q) { this.renderManage(q); },
  editById(id) {
    const s = _allStudents.find(s=>s.id===id);
    if(!s) return;
    _drawerStudent = s;
    closeModal('manageModal');
    this.editFromDrawer();
  },
  async deleteById(id, name) {
    if(!confirm(`Delete ${name}? This cannot be undone.`)) return;
    showSaving('Deleting…');
    try {
      await API.deleteStudent(id);
      _allStudents = _allStudents.filter(s=>s.id!==id);
      this.renderManage(document.getElementById('manageSearch').value);
      toast('🗑️ Student deleted','ok');
    } catch(e){ toast('⚠️ Delete failed','err'); }
    hideSaving();
  },
  addLeaderPrompt() {
    const name = prompt('Enter leader name:');
    if(!name?.trim()) return;
    API.addLeader(name.trim()).then(r => {
      if(r?.success) {
        _leaders.push(name.trim());
        const sel = document.getElementById('leaderSelect');
        const opt = document.createElement('option');
        opt.value = name.trim(); opt.textContent = name.trim();
        sel.appendChild(opt);
        sel.value = name.trim();
        toast('✅ Leader added','ok');
      } else toast('⚠️ '+(r?.error||'Failed'),'err');
    });
  },
  openBatch() {
    _batchSelected.clear();
    openModal('batchModal');
    this.renderBatch('');
  },
  filterBatch(q) { this.renderBatch(q); },
  renderBatch(q) {
    const students = q ? _allStudents.filter(s=>s.name?.toLowerCase().includes(q.toLowerCase())) : _allStudents;
    const el = document.getElementById('batchList');
    el.innerHTML = students.map(s => {
      const init = (s.name||'?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
      const checked = _checkedToday.has(s.id);
      const selected = _batchSelected.has(s.id);
      return `<div class="batch-row ${selected?'selected':''} ${checked?'already':''}" onclick="${!checked?`KIOSK.toggleBatch('${s.id}')`:''}" data-id="${s.id}">
        <div class="batch-av-ph" style="background:${this.gradientForName(s.name)}">${init}</div>
        <div class="batch-info"><div class="batch-name">${s.name}</div><div class="batch-meta">Grade ${s.grade||'—'} ${checked?'· Already checked in':''}</div></div>
        <div class="batch-chk">${(selected||checked)?'✓':''}</div>
      </div>`;
    }).join('');
    this.updateBatchUI();
  },
  toggleBatch(id) {
    if(_batchSelected.has(id)) _batchSelected.delete(id); else _batchSelected.add(id);
    const row = document.querySelector(`[data-id="${id}"]`);
    if(row) { row.classList.toggle('selected',_batchSelected.has(id)); row.querySelector('.batch-chk').textContent = _batchSelected.has(id)?'✓':''; }
    this.updateBatchUI();
  },
  updateBatchUI() {
    const n = _batchSelected.size;
    document.getElementById('batchPill').textContent = n;
    document.getElementById('batchGo').disabled = n===0;
    document.getElementById('batchSelLbl').textContent = n===0 ? 'No students selected' : `${n} student${n!==1?'s':''} selected`;
  },
  async submitBatch() {
    if(_batchSelected.size===0) return;
    if(!_kLeader){toast('⚠️ Start your session first','err');return;}
    showSaving(`Checking in ${_batchSelected.size} students…`);
    const ids = [..._batchSelected];
    try {
      const r = await API.batchCheckIn(ids, {leader:_kLeader, event:_kEvent});
      ids.forEach(id => _checkedToday.add(id));
      _batchSelected.clear();
      closeModal('batchModal');
      document.getElementById('kStatChecked').textContent = _checkedToday.size;
      toast(`✅ ${ids.length} students checked in!`,'ok');
    } catch(e){ toast('⚠️ Batch check-in failed','err'); }
    hideSaving();
  },
  gradientForName(name) {
    const h = [...(name||'')].reduce((a,c)=>a+c.charCodeAt(0),0);
    const hue = h % 360;
    return `hsl(${hue},50%,35%)`;
  }
};

/* ── DASHBOARD ── */
const DASH = {
  async init() {
    await this.refresh();
    clearInterval(_dashTimer);
    _dashTimer = setInterval(() => this.refresh(), 30000);
  },
  async refresh() {
    try {
      const [dash, week] = await Promise.all([API.getDashboard(), API.getWeeklyReport(0)]);
      this.renderStats(dash);
      this.renderFeed(dash?.checkins || []);
      this.renderBirthdays(dash?.birthdays || []);
      this.renderWeek(week);
    } catch(e) { toast('⚠️ Refresh failed','err'); }
  },
  renderStats(data) {
    const set = (id, val) => { const el=document.getElementById(id); if(el) el.textContent=val; };
    set('dStatToday', data?.totalToday ?? '—');
    set('dStatTodaySub', data?.event || 'Check-ins today');
    set('dStatTotal', data?.totalStudents ?? '—');
    set('dStatLeaders', data?.totalLeaders ?? '—');
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
    btn.classList.add('active');
    this.filterFeed(document.getElementById('feedSearch')?.value||'');
  },
  filterFeed(q) {
    let data = _feedData;
    if(_feedTab==='students') data = data.filter(c=>c.type!=='leader');
    else if(_feedTab==='leaders') data = data.filter(c=>c.type==='leader');
    else if(_feedTab==='new') data = data.filter(c=>c.isNew);
    if(q) data = data.filter(c=>(c.name||'').toLowerCase().includes(q.toLowerCase()));
    const el = document.getElementById('feedPanel');
    if(!data.length){el.innerHTML=`<div class="empty-state"><div class="empty-icon">📋</div><p class="empty-txt">No check-ins yet</p></div>`;return;}
    el.innerHTML = data.slice().reverse().map((c,i) => {
      const init = (c.name||'?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
      const isLdr = c.type==='leader';
      const time = c.time ? new Date(c.time).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}) : '';
      return `<div class="ci-row ${isLdr?'ldr':''}" style="animation-delay:${Math.min(i,10)*0.04}s">
        <div class="ci-av-ph ${isLdr?'ldr':''}">${init}</div>
        <div class="ci-info">
          <div class="ci-name">${c.name||'Unknown'}</div>
          <div class="ci-meta">${isLdr?`<span class="ldr-tag">Leader</span>`:`${c.grade?`<span class="ci-grade-chip">Gr ${c.grade}</span>`:''}${c.isNew?` <span class="new-tag">NEW</span>`:''}`} ${c.event||''}</div>
        </div>
        <div class="ci-time">${time}</div>
      </div>`;
    }).join('');
  },
  renderBirthdays(birthdays) {
    const scroll = document.getElementById('bdayScroll');
    document.getElementById('bdayCount').textContent = birthdays.length || '0';
    if(!birthdays.length){scroll.innerHTML='<div class="bday-empty">No birthdays this week 🎉</div>';return;}
    const today = new Date();
    scroll.innerHTML = birthdays.map(b => {
      const dob = new Date(b.dob||b.birthday);
      const isToday = dob.getMonth()===today.getMonth()&&dob.getDate()===today.getDate();
      const diff = Math.round((new Date(today.getFullYear(),dob.getMonth(),dob.getDate())-today)/(86400000));
      const chipClass = isToday?'today':diff<=3?'soon':'upcoming';
      const chipLabel = isToday?'Today!':diff===1?'Tomorrow!':diff<=0?'This week':`In ${diff}d`;
      const init = (b.name||'?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
      return `<div class="bday-card ${isToday?'is-today':''}">
        <div class="bday-av-ph">${init}</div>
        <div class="bday-name">${b.name?.split(' ')[0]||'?'}</div>
        <div class="bday-chip ${chipClass}">${chipLabel}</div>
      </div>`;
    }).join('');
  },
  renderWeek(data) {
    const el = document.getElementById('weekPanel');
    if(!data||!data.days){el.innerHTML='<div class="empty-state"><p class="empty-txt">No weekly data</p></div>';return;}
    const max = Math.max(...data.days.map(d=>d.count||0),1);
    el.innerHTML = `<div style="padding:12px 10px;display:flex;flex-direction:column;gap:8px">
      ${data.days.map(d=>`<div style="display:flex;align-items:center;gap:10px">
        <div style="font-size:10px;font-weight:700;color:var(--muted);width:70px;text-align:right">${d.label||d.date}</div>
        <div style="flex:1;height:8px;background:var(--surface);border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${((d.count||0)/max*100).toFixed(1)}%;background:linear-gradient(90deg,var(--green),var(--teal));border-radius:4px;transition:width .6s ease"></div>
        </div>
        <div style="font-family:var(--font);font-size:13px;font-weight:700;color:#67e8f9;min-width:24px;text-align:right">${d.count||0}</div>
      </div>`).join('')}
    </div>`;
  }
};

/* ── KIOSK NAV ── */
function showKiosk() {
  showView('vKiosk');
  document.getElementById('leaderLogin').classList.remove('gone');
  KIOSK.init();
}
function showDash() {
  showView('vDash');
}

/* ── INSTALL PROMPT ── */
let _installPrompt;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  _installPrompt = e;
});

/* ═══════════════════════════════════════════════════
   UPGRADE PACK — Dashboard, Kiosk, PWA
═══════════════════════════════════════════════════ */

/* ── DASHBOARD UPGRADES ── */
let _weekOffset = 0;

Object.assign(DASH, {
  async refresh() {
    try {
      const [dash, week, risk, analytics] = await Promise.all([
        API.getDashboard(),
        API.getWeeklyReport(_weekOffset),
        API.getAtRisk(),
        API.getAnalytics()
      ]);
      this.renderStats(dash);
      this.renderFeed(dash?.checkins || []);
      this.renderBirthdays(dash?.birthdays || []);
      this.renderWeek(week);
      this.renderAtRisk(risk);
      this.renderAnalytics(analytics);
    } catch(e) { toast('⚠️ Refresh failed — check connection','err'); }
  },

  renderAtRisk(data) {
    const el = document.getElementById('riskPanel');
    const count = document.getElementById('riskCount');
    const students = data?.students || data || [];
    count.textContent = students.length;
    if (!students.length) {
      el.innerHTML = `<div class="empty-state"><div class="empty-icon">✅</div><p class="empty-txt">No at-risk students — great attendance!</p></div>`;
      return;
    }
    el.innerHTML = students.map((s,i) => {
      const init = (s.name||'?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
      const pct = s.attendanceRate ?? Math.round((s.attended||0)/(s.total||1)*100);
      const barColor = pct < 40 ? '#ef4444' : pct < 60 ? '#f59e0b' : '#0d9488';
      return `<div class="ci-row" style="animation-delay:${i*0.04}s;flex-direction:column;align-items:flex-start;gap:6px;cursor:default">
        <div style="display:flex;align-items:center;gap:9px;width:100%">
          <div class="ci-av-ph" style="background:linear-gradient(135deg,#ef4444,#b91c1c)">${init}</div>
          <div class="ci-info">
            <div class="ci-name">${s.name}</div>
            <div class="ci-meta">Grade ${s.grade||'—'} · ${s.attended||0}/${s.total||0} sessions attended</div>
          </div>
          <div style="font-family:var(--font);font-size:16px;font-weight:800;color:${barColor}">${pct}%</div>
        </div>
        <div style="width:100%;height:5px;background:var(--surface2);border-radius:3px;overflow:hidden;margin-left:43px">
          <div style="height:100%;width:${pct}%;background:${barColor};border-radius:3px;transition:width .6s ease"></div>
        </div>
      </div>`;
    }).join('');
  },

  renderAnalytics(data) {
    const el = document.getElementById('analyticsPanel');
    const grades = data?.gradeBreakdown || data?.grades || [];
    if (!grades.length) {
      el.innerHTML = `<div class="empty-state"><p class="empty-txt">No analytics data yet</p></div>`;
      return;
    }
    const max = Math.max(...grades.map(g => g.count || 0), 1);
    const colors = ['#0d9488','#06b6d4','#8b5cf6','#f59e0b','#ef4444','#10b981','#3b82f6'];
    el.innerHTML = `<div style="padding:12px 10px;display:flex;flex-direction:column;gap:9px">
      ${grades.map((g,i) => `
        <div style="display:flex;align-items:center;gap:10px">
          <div style="font-size:10px;font-weight:700;color:var(--muted);width:60px;text-align:right;white-space:nowrap">Grade ${g.grade||g.label}</div>
          <div style="flex:1;height:10px;background:var(--surface);border-radius:5px;overflow:hidden">
            <div style="height:100%;width:${((g.count||0)/max*100).toFixed(1)}%;background:${colors[i%colors.length]};border-radius:5px;transition:width .7s ${i*0.06}s ease"></div>
          </div>
          <div style="font-family:var(--font);font-size:13px;font-weight:800;color:#67e8f9;min-width:28px;text-align:right">${g.count||0}</div>
        </div>`).join('')}
    </div>
    <div style="padding:0 10px 10px;font-size:10px;color:var(--muted2);text-align:center">Total: ${grades.reduce((a,g)=>a+(g.count||0),0)} students</div>`;
  },

  async lookupStudent(q) {
    const el = document.getElementById('lookupPanel');
    if (!q || q.length < 2) {
      el.innerHTML = `<div class="empty-state"><div class="empty-icon">🔎</div><p class="empty-txt">Type at least 2 characters to search</p></div>`;
      return;
    }
    const matches = _allStudents.filter(s => s.name?.toLowerCase().includes(q.toLowerCase())).slice(0,5);
    if (!matches.length) {
      el.innerHTML = `<div class="empty-state"><p class="empty-txt">No students found</p></div>`;
      return;
    }
    el.innerHTML = matches.map(s => {
      const init = (s.name||'?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
      return `<div class="ci-row" onclick="DASH.showStudentHistory('${s.id}','${s.name.replace(/'/,"\\'")}')">
        <div class="ci-av-ph">${init}</div>
        <div class="ci-info"><div class="ci-name">${s.name}</div><div class="ci-meta">Grade ${s.grade||'—'} · Click to view history</div></div>
        <div style="font-size:13px;color:var(--muted2)">›</div>
      </div>`;
    }).join('');
  },

  async showStudentHistory(id, name) {
    const el = document.getElementById('lookupPanel');
    el.innerHTML = `<div class="empty-state"><div class="spin" style="margin:0 auto"></div><p class="empty-txt">Loading history…</p></div>`;
    try {
      const r = await API.getHistory(id, name);
      const sessions = r?.history || r || [];
      if (!sessions.length) {
        el.innerHTML = `<div style="padding:8px 8px 4px"><button class="tab-btn active" onclick="document.getElementById('lookupSearch').value='';DASH.lookupStudent('')">← Back</button></div><div class="empty-state"><p class="empty-txt">No attendance history for ${name}</p></div>`;
        return;
      }
      const attended = sessions.filter(s=>s.attended).length;
      const pct = Math.round(attended/sessions.length*100);
      el.innerHTML = `
        <div style="padding:8px 8px 4px;display:flex;align-items:center;gap:8px">
          <button class="tab-btn active" onclick="document.getElementById('lookupSearch').value='';DASH.lookupStudent('')">← Back</button>
          <div style="flex:1;text-align:right;font-size:11px;font-weight:700;color:var(--muted)">${name}</div>
        </div>
        <div style="padding:8px 10px;background:var(--surface);border-radius:10px;margin:4px 8px;display:flex;align-items:center;gap:12px">
          <div style="text-align:center">
            <div style="font-family:var(--font);font-size:28px;font-weight:900;color:${pct>=70?'#67e8f9':pct>=50?'#fcd34d':'#fca5a5'}">${pct}%</div>
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted)">Attendance</div>
          </div>
          <div style="flex:1">
            <div style="height:8px;background:var(--surface2);border-radius:4px;overflow:hidden;margin-bottom:6px">
              <div style="height:100%;width:${pct}%;background:${pct>=70?'var(--green)':pct>=50?'#f59e0b':'#ef4444'};border-radius:4px;transition:width .6s ease"></div>
            </div>
            <div style="font-size:10px;color:var(--muted)">${attended} of ${sessions.length} sessions attended</div>
          </div>
        </div>
        <div style="padding:4px 8px">
          ${sessions.slice().reverse().map(s => `
            <div style="display:flex;align-items:center;gap:8px;padding:6px 6px;border-radius:8px;margin-bottom:3px;background:${s.attended?'rgba(13,148,136,0.05)':'rgba(239,68,68,0.05)'}">
              <div style="font-size:14px">${s.attended?'✅':'❌'}</div>
              <div style="flex:1;font-size:11px;font-weight:600;color:${s.attended?'var(--text)':'var(--muted)'}">${s.date||s.label||'Unknown'}</div>
              <div style="font-size:10px;color:var(--muted2)">${s.event||''}</div>
            </div>`).join('')}
        </div>`;
    } catch(e) { el.innerHTML = `<div class="empty-state"><p class="empty-txt">Error loading history</p></div>`; }
  },

  changeWeek(dir) {
    _weekOffset = Math.max(0, _weekOffset + (dir === -1 ? 1 : -1));
    const el = document.getElementById('reportWeekLabel');
    if (el) el.textContent = _weekOffset === 0 ? 'This Week' : _weekOffset === 1 ? 'Last Week' : `${_weekOffset} Weeks Ago`;
    const nextBtn = document.getElementById('reportNext');
    if (nextBtn) nextBtn.disabled = _weekOffset === 0;
    API.getWeeklyReport(_weekOffset).then(r => this.renderWeek(r)).catch(()=>{});
  },

  renderWeek(data) {
    const el = document.getElementById('reportPanel') || document.getElementById('weekPanel');
    if (!el) return;
    const days = data?.days || [];
    if (!days.length) { el.innerHTML = `<div class="empty-state"><p class="empty-txt">No data for this week</p></div>`; return; }
    const max = Math.max(...days.map(d=>d.count||0),1);
    const total = days.reduce((a,d)=>a+(d.count||0),0);
    const leaders = days.reduce((a,d)=>a+(d.leaders||0),0);
    el.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:10px;margin-bottom:4px">
        <div style="background:var(--soft);border:1px solid rgba(13,148,136,.25);border-radius:10px;padding:10px;text-align:center">
          <div style="font-family:var(--font);font-size:26px;font-weight:900;color:#67e8f9">${total}</div>
          <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted)">Check-ins</div>
        </div>
        <div style="background:rgba(6,182,212,.07);border:1px solid rgba(6,182,212,.2);border-radius:10px;padding:10px;text-align:center">
          <div style="font-family:var(--font);font-size:26px;font-weight:900;color:#67e8f9">${leaders}</div>
          <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted)">Leaders</div>
        </div>
      </div>
      <div style="padding:4px 10px 10px;display:flex;flex-direction:column;gap:7px">
        ${days.map(d=>`
          <div style="display:flex;align-items:center;gap:10px">
            <div style="font-size:10px;font-weight:700;color:var(--muted);width:80px;text-align:right;white-space:nowrap">${d.label||d.date}</div>
            <div style="flex:1;height:8px;background:var(--surface);border-radius:4px;overflow:hidden">
              <div style="height:100%;width:${((d.count||0)/max*100).toFixed(1)}%;background:linear-gradient(90deg,var(--green),var(--teal));border-radius:4px;transition:width .6s ease"></div>
            </div>
            <div style="font-family:var(--font);font-size:12px;font-weight:800;color:#67e8f9;min-width:24px;text-align:right">${d.count||0}</div>
          </div>`).join('')}
      </div>`;
  },

  exportReport() {
    const rows = [['Date','Check-ins','Leaders','New Students']];
    const panels = document.querySelectorAll('#reportPanel [style*="display:flex;align-items:center;gap:10px"]');
    if (!panels.length) { toast('⚠️ No report data to export','err'); return; }
    // Build CSV from rendered week data
    const csv = 'data:text/csv;charset=utf-8,' + rows.map(r=>r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = encodeURI(csv);
    a.download = `bolt-report-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    toast('📥 Report exported','ok');
  },

  async openLeaders() {
    openModal('leadersModal');
    const el = document.getElementById('leadersList');
    el.innerHTML = '<div class="empty-state"><div class="spin" style="margin:0 auto 8px"></div><p>Loading…</p></div>';
    try {
      const r = await API.getLeaders();
      _leaders = r?.leaders || r || [];
      this.renderLeaders();
    } catch(e) { el.innerHTML = '<div class="empty-state"><p>Error loading leaders</p></div>'; }
  },

  renderLeaders() {
    const el = document.getElementById('leadersList');
    if (!_leaders.length) { el.innerHTML = '<div class="empty-state"><p class="empty-txt">No leaders yet — add one below</p></div>'; return; }
    el.innerHTML = _leaders.map(name => {
      const init = (name||'?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
      return `<div class="ms-row">
        <div class="ms-av" style="background:linear-gradient(135deg,var(--teal),#0284c7)">${init}</div>
        <div class="ms-info"><div class="ms-name">${name}</div><div class="ms-meta">Leader</div></div>
      </div>`;
    }).join('');
  },

  async addLeader() {
    const name = prompt('Enter leader name:');
    if (!name?.trim()) return;
    try {
      const r = await API.addLeader(name.trim());
      if (r?.success) {
        _leaders.push(name.trim());
        this.renderLeaders();
        toast('✅ Leader added','ok');
      } else toast('⚠️ '+(r?.error||'Failed'),'err');
    } catch(e) { toast('⚠️ Connection error','err'); }
  }
});

/* ── KIOSK UPGRADES ── */
Object.assign(KIOSK, {
  // Enhanced search with keyboard shortcut
  focusSearch() {
    const s = document.getElementById('kSearch');
    if (s) { s.focus(); s.select(); }
  }
});

// Keyboard shortcut: / to focus search in kiosk
document.addEventListener('keydown', e => {
  if (e.key === '/' && document.getElementById('vKiosk').classList.contains('active')) {
    e.preventDefault();
    KIOSK.focusSearch();
  }
  if (e.key === 'Escape') {
    closeDrawer();
    closeThemePicker();
    document.querySelectorAll('.modal.open,.manage-modal.open,.batch-modal.open').forEach(m => m.classList.remove('open'));
  }
});

/* ── PWA: INSTALL PROMPT ── */
let _installPromptEvent = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  _installPromptEvent = e;
  // Show install banner after 3s if not already installed
  setTimeout(() => {
    const banner = document.getElementById('installBanner');
    if (banner && !localStorage.getItem('bolt_install_dismissed')) {
      banner.style.display = 'flex';
    }
  }, 3000);
});

function installApp() {
  if (!_installPromptEvent) {
    toast('Use browser menu → "Add to Home Screen"','ok');
    dismissInstall();
    return;
  }
  _installPromptEvent.prompt();
  _installPromptEvent.userChoice.then(r => {
    if (r.outcome === 'accepted') {
      toast('🎉 Bolt Kiosk installed!','ok');
      dismissInstall();
    }
    _installPromptEvent = null;
  });
}

function dismissInstall() {
  const banner = document.getElementById('installBanner');
  if (banner) banner.style.display = 'none';
  localStorage.setItem('bolt_install_dismissed', '1');
}

window.addEventListener('appinstalled', () => {
  toast('🎉 Bolt Kiosk installed successfully!','ok');
  dismissInstall();
});

/* ── PWA: OFFLINE DETECTION ── */
window.addEventListener('online', () => toast('✅ Back online','ok'));
window.addEventListener('offline', () => toast('⚠️ You are offline — some features may not work','err'));

/* ── PULL-TO-REFRESH on Dashboard ── */
(function setupPullToRefresh() {
  let startY = 0;
  let pulling = false;
  const el = document.getElementById('vDash');
  if (!el) return;
  el.addEventListener('touchstart', e => { startY = e.touches[0].clientY; pulling = el.scrollTop <= 0; }, {passive:true});
  el.addEventListener('touchend', e => {
    if (!pulling) return;
    const diff = e.changedTouches[0].clientY - startY;
    if (diff > 80) { DASH.refresh(); toast('↻ Refreshing…','ok'); }
    pulling = false;
  }, {passive:true});
})();

/* ── LOAD ALL STUDENTS FOR DASHBOARD LOOKUP ── */
const _origDashInit = DASH.init.bind(DASH);
DASH.init = async function() {
  // Preload students for lookup
  if (!_allStudents.length) {
    try {
      const r = await API.getAllStudents();
      _allStudents = r?.students || r || [];
    } catch(e) {}
  }
  return _origDashInit();
};
