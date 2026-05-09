/* ═══════════════════════════════════════════════════
   BOLT KIOSK PWA — Main App Logic v2
═══════════════════════════════════════════════════ */

/* ── SESSION ── */
const SESSION = { token:'', name:'', role:'', username:'', orgId:'' };

/* ── Mobile detection helper ── */
function isMobile() { return window.innerWidth <= 600; }
function isTablet() { return window.innerWidth > 600 && window.innerWidth <= 900; }

/* ═══════════════════════════════════════════════
   BOLT KIOSK — SVG ICON SYSTEM v2
   Professional stroke icons — replaces all emoji
═══════════════════════════════════════════════ */
const BK_ICONS = {
  'home': `<path d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 22V12h6v10"/>`,
  'bolt': `<path d="M13 2L4.5 13.5H12L11 22l8.5-11.5H13L13 2z"/>`,
  'dashboard': `<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><path d="M13 17h8M17 13v8"/>`,
  'search': `<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>`,
  'person': `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
  'people': `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>`,
  'child': `<circle cx="12" cy="6" r="3"/><path d="M9 20l-2-8h10l-2 8"/><path d="M7.5 13l-2 7M16.5 13l2 7"/>`,
  'calendar': `<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`,
  'shield': `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
  'groups': `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>`,
  'schedule': `<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" stroke-width="2.5"/>`,
  'edit': `<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>`,
  'delete': `<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>`,
  'plus': `<path d="M12 5v14M5 12h14"/>`,
  'close': `<path d="M18 6L6 18M6 6l12 12"/>`,
  'check': `<polyline points="20 6 9 17 4 12"/>`,
  'warning': `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17" stroke-width="2.5"/>`,
  'star': `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
  'tag': `<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7" stroke-width="2.5"/>`,
  'print': `<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/>`,
  'email': `<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/>`,
  'phone': `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>`,
  'location': `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>`,
  'birthday': `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M8 3.5c0-1 1-2 2-1.5s2 .5 2-.5 1-2 2-1.5"/>`,
  'camera': `<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>`,
  'emergency': `<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M12 8v4M12 16h.01" stroke-width="2.5"/>`,
  'lock': `<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`,
  'eye': `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`,
  'eyeOff': `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`,
  'save': `<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>`,
  'refresh': `<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>`,
  'signout': `<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>`,
  'arrow': `<path d="M5 12h14M12 5l7 7-7 7"/>`,
  'manage': `<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6" stroke-width="2.5"/><line x1="3" y1="12" x2="3.01" y2="12" stroke-width="2.5"/><line x1="3" y1="18" x2="3.01" y2="18" stroke-width="2.5"/>`,
  'analytics': `<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>`,
  'report': `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/>`,
  'download': `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>`,
  'qr': `<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none"/><rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none"/><rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none"/><path d="M14 14h3v3h-3zM17 14h3M17 17v3M14 17v3"/>`,
  'batch': `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>`,
  'live': `<circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><path d="M6.3 6.3a8 8 0 0 0 0 11.4M17.7 6.3a8 8 0 0 1 0 11.4"/><path d="M9.2 9.2a4 4 0 0 0 0 5.6M14.8 9.2a4 4 0 0 1 0 5.6"/>`,
  'more': `<circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/>`,
  'firstTimer': `<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>`,
  'note': `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/>`,
  'rsvp': `<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>`,
  'key': `<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>`,
  'filter': `<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>`
};

function icon(name, size=18, cls='', style='') {
  const paths = BK_ICONS[name] || BK_ICONS.bolt;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="bk-icon ${cls}" style="vertical-align:middle;flex-shrink:0;display:inline-block;${style}">${paths}</svg>`;
}


/* ═══════════════════════════════════════════════
   HOME ICON PATCH — replaces emoji in static HTML
   Direct innerHTML replacement on icon containers
═══════════════════════════════════════════════ */
(function patchHomeIcons() {

  // SVG icon generator
  function mkSvg(paths, sz) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="'+sz+'" height="'+sz+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block">'+paths+'</svg>';
  }

  var PATHS = {
    bolt:      '<path d="M13 2L4.5 13.5H12L11 22l8.5-11.5H13Z"/>',
    dash:      '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 18h7M17.5 14.5v7"/>',
    child:     '<circle cx="12" cy="6" r="3"/><path d="M9 21v-5a3 3 0 0 1 6 0v5"/><path d="M6 21l3-5M18 21l-3-5"/>',
    shield:    '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    schedule:  '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" stroke-width="2.5"/>',
    home:      '<path d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 22V12h6v10"/>',
    groups:    '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    analytics: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>'
  };

  // Map: text content → icon key
  // We match based on what the parent card does (onclick) rather than emoji value
  // since emoji can vary by OS/font
  function patchIcons() {
    // ── Home cards: replace .hc-icon and .hc-icon-lg content ──
    document.querySelectorAll('.hc-icon, .hc-icon-lg').forEach(function(el) {
      // Determine which icon to use based on the card's onclick
      var card = el.closest('[onclick]');
      var fn = card ? (card.getAttribute('onclick') || '') : '';
      var key = null;
      if (fn.indexOf('showKiosk') >= 0)          key = 'bolt';
      else if (fn.indexOf('showDash') >= 0)       key = 'dash';
      else if (fn.indexOf('showCM') >= 0)         key = 'child';
      else if (fn.indexOf('openVolDeptModal') >= 0) key = 'shield';
      else if (fn.indexOf('showSchedule') >= 0)   key = 'schedule';
      else if (fn.indexOf('showSmallGroups') >= 0) key = 'groups';
      if (key && PATHS[key]) {
        var sz = el.classList.contains('hc-icon-lg') ? 28 : 26;
        el.innerHTML = mkSvg(PATHS[key], sz);
        // Remove font-size so SVG isn't sized like text
        el.style.fontSize = '0';
      }
    });

    // ── Mobile nav: replace emoji span content ──
    document.querySelectorAll('.mob-nav-btn').forEach(function(btn) {
      var fn  = btn.getAttribute('onclick') || '';
      var view = btn.getAttribute('data-view') || '';
      var key = null;
      var sz  = 22;
      if (view === 'vHome' || fn.indexOf("'vHome'") >= 0)        key = 'home';
      else if (view === 'vKiosk' || fn.indexOf('showKiosk') >= 0)     key = 'bolt';
      else if (view === 'vDash' || fn.indexOf('showDash') >= 0)       key = 'analytics';
      else if (view === 'vCM' || fn.indexOf('showCM') >= 0)           key = 'child';
      else if (view === 'vVolunteers' || fn.indexOf('VolDept') >= 0)   key = 'shield';
      else if (view === 'vSmallGroups' || fn.indexOf('SmallGroups') >= 0) key = 'groups';
      else if (view === 'vSchedule' || fn.indexOf('showSchedule') >= 0)  key = 'schedule';

      if (key && PATHS[key]) {
        // Find the emoji span (first span, usually large font-size)
        var spans = btn.querySelectorAll('span');
        if (spans.length > 0) {
          var iconSpan = spans[0];
          iconSpan.innerHTML = mkSvg(PATHS[key], sz);
          iconSpan.style.fontSize = '0';
          iconSpan.style.display = 'flex';
          iconSpan.style.alignItems = 'center';
          iconSpan.style.justifyContent = 'center';
          iconSpan.style.width = sz + 'px';
          iconSpan.style.height = sz + 'px';
        }
      }
    });
  }

  // Run immediately and also after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      patchIcons();
      setTimeout(patchIcons, 500); // extra pass for late renders
    });
  } else {
    patchIcons();
    setTimeout(patchIcons, 300);
  }

  // Also hook into showView to re-patch when home is shown
  window.addEventListener('load', function() {
    patchIcons();
    setTimeout(patchIcons, 800);
    // Override showView to patch after nav
    var origShow = window.showView;
    if (origShow) {
      window.showView = function(id) {
        origShow(id);
        if (id === 'vHome') setTimeout(patchIcons, 50);
      };
    }
  });

})();



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
  applyOrientation();
  if (id === 'vDash') DASH.init();
  // Mobile bottom nav — only show on small screens for main views
  document.querySelectorAll('.mob-nav-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector('.mob-nav-btn[data-view="'+id+'"]');
  if(btn) btn.classList.add('active');
  const mobNav = document.getElementById('mobileNav');
  if(mobNav) {
    // On mobile, show nav for all main views — CSS hides items 4-6
    const mainViews = ['vHome','vKiosk','vDash','vCM','vVolunteers','vSmallGroups','vSchedule'];
    mobNav.style.display = (window.innerWidth<=600 && mainViews.includes(id)) ? 'flex' : 'none';
    // Highlight active nav btn
    document.querySelectorAll('.mob-nav-btn').forEach(b=>b.classList.remove('active'));
    const activeBtn=document.querySelector('.mob-nav-btn[data-view="'+id+'"]');
    if(activeBtn)activeBtn.classList.add('active');
  }
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
  toast('Theme applied', 'ok');
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
    ${hasAllergy ? `<div class="d-sec ec"><div class="d-sec-lbl"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Allergies / Medical</div><div class="d-field-val">${student.allergies}</div></div>` : ''}
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

  const _params = new URLSearchParams(window.location.search);

  // ── RSVP link: isolated page, no auth ──
  if (_params.get('rsvp') && _params.get('r')) {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.body.style.background = '#0a1628';
    const rsvpPage = document.getElementById('vRsvp');
    if (rsvpPage) rsvpPage.style.display = 'flex';
    setTimeout(() => SCHED.handleRsvp(_params.get('rsvp'), _params.get('r')), 400);
    return;
  }

  // ── Returning from auth.html login — restore session from URL params ──
  const urlToken  = _params.get('token');
  const urlOrgId  = _params.get('orgId');
  const urlUser   = _params.get('user');

  if (urlToken && urlUser) {
    try {
      const userObj = JSON.parse(decodeURIComponent(urlUser));
      // Restore full session including orgId
      SESSION.token    = decodeURIComponent(urlToken);
      SESSION.orgId    = decodeURIComponent(urlOrgId || 'ORG_DEFAULT');
      SESSION.name     = userObj.name     || '';
      SESSION.role     = userObj.role     || '';
      SESSION.username = userObj.username || '';
      // Persist session for GAS sub-pages
      try { sessionStorage.setItem('bk_token',SESSION.token); sessionStorage.setItem('bk_orgId',SESSION.orgId); sessionStorage.setItem('bk_name',SESSION.name); sessionStorage.setItem('bk_role',SESSION.role); } catch(e){}
      window.SESSION = SESSION;
      // Store server-side for GAS page access
      try { google.script.run.withSuccessHandler(function(r){if(r&&r.key)SESSION.sessionKey=r.key;window.SESSION=SESSION;}).storeSessionToken(SESSION.token); } catch(e){}
      // Remove params from URL so refresh doesn't re-use the same token params
      window.history.replaceState({}, '', window.location.pathname);
      // Go straight to home
      const greetEl = document.getElementById('homeGreet');
      if (greetEl) greetEl.textContent = 'Hey, ' + SESSION.name + '!';
      setTimeout(() => showView('vHome'), 100);
      return;
    } catch(err) {
      console.error('Session restore error:', err);
    }
  }

  // ── Normal load: require authentication ──
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
        SESSION.token=r.token; SESSION.name=r.name; SESSION.role=r.role; SESSION.username=r.username; SESSION.orgId=r.orgId||'ORG_DEFAULT';
      try { sessionStorage.setItem('bk_token',SESSION.token); sessionStorage.setItem('bk_orgId',SESSION.orgId); sessionStorage.setItem('bk_name',SESSION.name); sessionStorage.setItem('bk_role',SESSION.role); } catch(e){}
      window.SESSION = SESSION;
      try { google.script.run.withSuccessHandler(function(r){if(r&&r.key)SESSION.sessionKey=r.key;window.SESSION=SESSION;}).storeSessionToken(SESSION.token); } catch(e){}
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
    const ch= document.getElementById('regChurch')?.value.trim() || '';
    const n = document.getElementById('regName').value.trim();
    const e = document.getElementById('regEmail').value.trim();
    const u = document.getElementById('regUser').value.trim();
    const p = document.getElementById('regPass').value;
    this.clearMsgs();
    if(!ch){this.showErr('regErr','Church or organization name is required.');return;}
    if(!n||!e||!u||!p){this.showErr('regErr','All fields are required.');return;}
    this.setLoading(true);
    this.showOk('regOk','Setting up your organization… this may take 15–20 seconds.');
    try {
      const r = await gasRun('createOrganizationAPI', ch, e, n, u, p);
      if(r?.success){
        this.showOk('regOk','Organization created! Sign in now.');
        setTimeout(()=>this.tab('login'),2000);
      } else {
        this.showErr('regErr', r?.error||'Registration failed.');
      }
    } catch(err){this.showErr('regErr','Connection error.');}
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
  Object.assign(SESSION,{token:'',name:'',role:'',username:'',orgId:''});
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
      const _sc1=document.getElementById('kStatChecked');if(_sc1)_sc1.textContent=_checkedToday.size;
      const _sc2=document.getElementById('kStatCheckedSide');if(_sc2)_sc2.textContent=_checkedToday.size;
    } catch(e){ console.error('loadCheckins error',e); }
  },

  async startSession() {
    const sel = document.getElementById('leaderSelect');
    if(!sel.value){toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Select your name first','err');return;}
    _kLeader = sel.value;
    document.getElementById('epGreeting').textContent = `Hey, ${_kLeader}!`;
      document.getElementById('eventPicker').classList.add('open');
  },

  selectEvent(el, name, icon, desc) {
    document.querySelectorAll('.ep-opt').forEach(o=>o.classList.remove('selected'));
    el.classList.add('selected');
    _selectedEvent = {name,icon,desc};
    document.getElementById('epOtherWrap').classList.toggle('show', name==='__other__');
  },

  confirmEvent() {
    if(!_selectedEvent){toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Pick an event type','err');return;}
    let eventName = _selectedEvent.name;
    if(eventName==='__other__'){
      eventName = document.getElementById('epOtherInput').value.trim();
      if(!eventName){toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Enter event name','err');return;}
    }

    // Auto-set leader from signed-in session — no leader login screen needed
    if(!_kLeader && SESSION.name) _kLeader = SESSION.name;
    if(!_kLeader) _kLeader = 'Staff';

    // Update greeting with leader name
    const greetEl = document.getElementById('epGreeting');
    if(greetEl && SESSION.name) {
    const isMob = window.innerWidth <= 600;
    greetEl.textContent = isMob ? 'Hey, ' + SESSION.name.split(' ')[0] + '!' : 'Hey, ' + SESSION.name + '!';
  }

    // ── Small Groups → skip kiosk, go straight to SG view ──
    if(eventName === 'Small Groups') {
      _kEvent = 'Small Groups';
      document.getElementById('eventPicker').classList.remove('open');
      SG.open();
      API.checkIn({type:'leader',leader:_kLeader},{leader:_kLeader,event:'Small Groups',type:'leader'}).catch(()=>{});
      toast('Small Groups started','ok');
      return;
    }

    _kEvent = eventName;
    document.getElementById('eventPicker').classList.remove('open');
    document.getElementById('kLeaderName').textContent = _kLeader;
    document.getElementById('kEventName').textContent = eventName;
    document.getElementById('kLeaderBox').classList.add('show');
    // Update sidebar labels to match event context
    KIOSK.updateSidebarLabels(eventName);

    // Style the kiosk header based on event type
    const eventStyles = {
      'Sunday Service':      { color:'#fcd34d', border:'rgba(245,158,11,0.3)',  bg:'rgba(245,158,11,0.08)',  icon:icon('people',18) },
      'Youth Night':         { color:'#67e8f9', border:'rgba(6,182,212,0.3)',   bg:'rgba(6,182,212,0.08)',   icon:icon('bolt',18) },
      'Special Event':       { color:'#c4b5fd', border:'rgba(139,92,246,0.3)', bg:'rgba(139,92,246,0.08)', icon:icon('star',18) },
      'Childrens Ministry':  { color:'#6ee7b7', border:'rgba(16,185,129,0.3)', bg:'rgba(16,185,129,0.08)', icon:icon('child',18) },
    };
    const style = eventStyles[eventName] || { color:'var(--muted)', border:'var(--rim)', bg:'transparent', icon:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' };
    const lbox = document.getElementById('kLeaderBox');
    if (lbox) {
      lbox.style.borderColor = style.border;
      lbox.style.background  = style.bg;
    }
    const evEl = document.getElementById('kEventName');
    if (evEl) evEl.style.color = style.color;
    const kSide = document.querySelector('.k-side');
    if (kSide) kSide.style.borderRight = `1px solid ${style.border}`;

    // Show & style the event banner in the kiosk main area
    const bannerConfig = {
      'Sunday Service':     { bg:'rgba(245,158,11,0.1)',  border:'rgba(245,158,11,0.35)',  color:'#fcd34d', title:'Sunday Service',    desc:'Register first timers · update member records · check in',       icon:icon('people',18) },
      'Youth Night':        { bg:'rgba(6,182,212,0.1)',   border:'rgba(6,182,212,0.35)',   color:'#67e8f9', title:'Youth Night',        desc:'Wednesday or Friday event — check in youth & leaders',     icon:icon('bolt',18) },
      'Special Event':      { bg:'rgba(139,92,246,0.1)',  border:'rgba(139,92,246,0.35)',  color:'#c4b5fd', title:'Special Event',      desc:'Camp, conference, or retreat check-in',                   icon:icon('star',18) },
      'Childrens Ministry': { bg:'rgba(16,185,129,0.1)', border:'rgba(16,185,129,0.35)', color:'#6ee7b7', title:"Children's Ministry", desc:'Use the Families button for child check-in & name tags',  icon:icon('child',18) },
    };
    const bc = bannerConfig[eventName] || { bg:'rgba(100,116,139,0.1)', border:'rgba(100,116,139,0.3)', color:'var(--muted)', title:eventName, desc:'Custom event — search to check in attendees', icon:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' };

    const banner = document.getElementById('kEventBanner');
    if (banner) {
      banner.style.display = 'block';
      banner.style.background = bc.bg;
      banner.style.borderColor = bc.border;
      banner.style.color = bc.color;
      const icon = document.getElementById('kBannerIcon'); if(icon) icon.innerHTML = bc.icon;
      const title = document.getElementById('kBannerTitle'); if(title) title.textContent = bc.title;
      const desc = document.getElementById('kBannerDesc'); if(desc) desc.textContent = bc.desc;
    }

    // Event-specific button labels and search placeholders
    const acts = document.getElementById('kActionsRow');
    const searchEl = document.getElementById('kSearch');

    // Config per event type — defines all labels so nothing is hardcoded
    const evtCfg = {
      'Sunday Service':       { search:'Search members or guests…',  addBtn:icon('plus',13)+' New Member',    addLbl:'New Member',    manageLbl:'Update Records', batchLbl:'Batch Check-In', firstTimer:true,  firstLbl:icon('star',13)+' Register First Timer' },
      'Youth Night':          { search:'Search students by name…',   addBtn:'<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 5v14M5 12h14"/></svg> New Student',   addLbl:'New Student',   manageLbl:'Manage',         batchLbl:'Batch Check-In', firstTimer:false },
      'Young Adult Ministry': { search:'Search attendees by name…',  addBtn:'<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 5v14M5 12h14"/></svg> New Attendee',  addLbl:'New Attendee',  manageLbl:'Update Records', batchLbl:'Batch Check-In', firstTimer:true,  firstLbl:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Register First Timer' },
      'Small Groups':         { search:'Search group members…',      addBtn:icon('plus',13)+' New Member',    addLbl:'New Member',    manageLbl:'Manage Groups',  batchLbl:'Batch Check-In', firstTimer:false },
      'Special Event':        { search:'Search attendees…',          addBtn:'<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 5v14M5 12h14"/></svg> New Attendee',  addLbl:'New Attendee',  manageLbl:'Manage',         batchLbl:'Batch Check-In', firstTimer:true,  firstLbl:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Register Guest' },
    };
    const cfg = evtCfg[eventName] || { search:'Search by name…', addBtn:'<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 5v14M5 12h14"/></svg> Add Attendee', addLbl:'Add Attendee', manageLbl:'Manage', batchLbl:'Batch Check-In', firstTimer:false };

    // Store cfg for use in batch modal and other places
    window._kEventCfg = cfg;
    window._kEventName = eventName;

    // Update search placeholder
    if (searchEl) searchEl.placeholder = cfg.search;

    // Build action buttons
    if (acts) {
      if (cfg.firstTimer) {
        acts.innerHTML = `
          <button class="k-btn amber full" onclick="KIOSK.openFirstTimerFlow()" style="background:rgba(245,158,11,0.18);border-color:rgba(245,158,11,0.5);color:#fcd34d;font-weight:800">${cfg.firstLbl}</button>
          <button class="k-btn" onclick="KIOSK.openBatch()">${cfg.batchLbl ? icon('batch',13)+' '+cfg.batchLbl : icon('batch',13)+' Batch Check-In'}</button>
          <button class="k-btn" onclick="KIOSK.openNewStudent()">${cfg.addBtn}</button>
          <button class="k-btn" onclick="KIOSK.openManage()"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6" stroke-width="2.5"/><line x1="3" y1="12" x2="3.01" y2="12" stroke-width="2.5"/><line x1="3" y1="18" x2="3.01" y2="18" stroke-width="2.5"/></svg> ${cfg.manageLbl}</button>`;
      } else {
        acts.innerHTML = `
          <button class="k-btn teal full" onclick="KIOSK.openBatch()"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg> ${cfg.batchLbl || 'Batch Check-In'}</button>
          <button class="k-btn" onclick="KIOSK.openNewStudent()">${cfg.addBtn}</button>
          <button class="k-btn" onclick="KIOSK.openManage()"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6" stroke-width="2.5"/><line x1="3" y1="12" x2="3.01" y2="12" stroke-width="2.5"/><line x1="3" y1="18" x2="3.01" y2="18" stroke-width="2.5"/></svg> ${cfg.manageLbl}</button>`;
      }
    }

    // Sunday Service welcome state on empty results
    if (eventName === 'Sunday Service') {
      const results = document.getElementById('kResults');
      if (results) results.innerHTML = `
        <div style="padding:30px 20px;text-align:center">
          <div style="font-size:48px;margin-bottom:14px"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
          <div style="font-family:var(--font);font-size:17px;font-weight:800;color:var(--text);margin-bottom:6px">Welcome to Sunday Service</div>
          <div style="font-size:13px;color:var(--muted);margin-bottom:24px;line-height:1.6">Search for a member or guest above,<br>or use the quick actions below</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:400px;margin:0 auto">
            <button onclick="KIOSK.openFirstTimerFlow()" style="padding:14px 10px;border-radius:14px;background:rgba(245,158,11,0.12);border:1.5px solid rgba(245,158,11,0.4);color:#fcd34d;font-family:var(--body);font-size:12px;font-weight:800;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:24px"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span>First Timer</button>
            <button onclick="KIOSK.openBatch()" style="padding:14px 10px;border-radius:14px;background:var(--surface2);border:1.5px solid var(--rim);color:var(--muted);font-family:var(--body);font-size:12px;font-weight:700;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:24px"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>Batch Check-In</button>
            <button onclick="KIOSK.openNewStudent()" style="padding:14px 10px;border-radius:14px;background:var(--surface2);border:1.5px solid var(--rim);color:var(--muted);font-family:var(--body);font-size:12px;font-weight:700;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:24px"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 5v14M5 12h14"/></svg></span>New Member</button>
            <button onclick="KIOSK.openManage()" style="padding:14px 10px;border-radius:14px;background:var(--surface2);border:1.5px solid var(--rim);color:var(--muted);font-family:var(--body);font-size:12px;font-weight:700;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px"><span style="font-size:24px"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6" stroke-width="2.5"/><line x1="3" y1="12" x2="3.01" y2="12" stroke-width="2.5"/><line x1="3" y1="18" x2="3.01" y2="18" stroke-width="2.5"/></svg></span>Update Records</button>
          </div>
        </div>`;
    }

    API.checkIn({type:'leader',leader:_kLeader}, {leader:_kLeader,event:eventName,type:'leader'}).catch(()=>{});
    toast(`${style.icon} Session started — ${eventName}`,'ok');
  },

  updateSidebarLabels(eventName) {
    const labelMap = {
      'Sunday Service':       { total:'Attendees', checked:'Checked In', newBtn:'New Member',    regTitle:'Register Member / Guest',   saveBtn:'Register & Save' },
      'Youth Night':          { total:'Students',  checked:'Checked In', newBtn:'New Student',   regTitle:'Register Student',          saveBtn:'Register & Save' },
      'Young Adult Ministry': { total:'Attendees', checked:'Checked In', newBtn:'New Attendee',  regTitle:'Register Young Adult',      saveBtn:'Register & Save' },
      'Small Groups':         { total:'Members',   checked:'Checked In', newBtn:'New Member',    regTitle:'Register Member',           saveBtn:'Register & Save' },
      'Special Event':        { total:'Attendees', checked:'Checked In', newBtn:'New Attendee',  regTitle:'Register Attendee',         saveBtn:'Register & Save' },
    };
    const lbl = labelMap[eventName] || { total:'Attendees', checked:'Checked In', newBtn:'New Attendee', regTitle:'Register Attendee', saveBtn:'Register & Save' };

    // Update sidebar stat labels
    const el1 = document.getElementById('kLblChecked'); if(el1) el1.textContent = lbl.checked;
    const el2 = document.getElementById('kLblTotal');   if(el2) el2.textContent = lbl.total;

    // Update action buttons text dynamically
    const acts = document.getElementById('kActionsRow');
    if(acts) {
      acts.querySelectorAll('button').forEach(btn => {
        if(btn.textContent.includes('New Student') || btn.textContent.includes('New Member') || btn.textContent.includes('New Attendee')) {
          btn.innerHTML = btn.innerHTML.replace(/New (Student|Member|Attendee)/, lbl.newBtn);
        }
      });
    }

    // Store for modal title use
    window._kRegLabel = lbl;
  },

  search(q) {
    document.getElementById('kClear').classList.toggle('show', q.length>0);
    if(!q.trim()){
      document.getElementById('kResults').innerHTML = `<div class="k-empty"><div class="k-empty-icon"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg></div><div class="k-empty-title">Search for a student</div><div class="k-empty-sub">Type a name to find and check in</div></div>`;
      return;
    }
    const ql = q.toLowerCase();
    const results = _allStudents.filter(s=>(s.name||'').toLowerCase().includes(ql));
    this.renderResults(results);
  },

  renderResults(students) {
    const el = document.getElementById('kResults');
    if(!students.length){
      el.innerHTML=`<div class="k-empty"><div class="k-empty-icon"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div><div class="k-empty-title">No students found</div><div class="k-empty-sub">Try a different name or add a new student</div></div>`;
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
            ${isBday?`<span class="s-badge bday">${icon('birthday',11)} Birthday</span>`:''}
            ${hasAllergy?`<span class="s-badge allergy"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Allergy</span>`:''}
            ${checked?`<span class="s-badge ec"><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> Checked In</span>`:''}
          </div>
        </div>
        ${checked?'<div class="s-check">✓</div>':`<div class="s-arrow" onclick="event.stopPropagation();KIOSK.openDrawerById('${s.id}')">›</div>`}
      </div>`;
    }).join('');
  },

  async checkIn(studentId, name) {
    if(!_kLeader){toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Start your session first','err');return;}
    const sid = String(studentId);
    const student = _allStudents.find(s=>String(s.id)===sid);
    if(!student) return;
    if(_checkedToday.has(sid)){this.showAlready(name);return;}
    // Optimistic
    _checkedToday.add(sid);
    const _sc1=document.getElementById('kStatChecked');if(_sc1)_sc1.textContent=_checkedToday.size;
      const _sc2=document.getElementById('kStatCheckedSide');if(_sc2)_sc2.textContent=_checkedToday.size;
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
        const _sc1=document.getElementById('kStatChecked');if(_sc1)_sc1.textContent=_checkedToday.size;
      const _sc2=document.getElementById('kStatCheckedSide');if(_sc2)_sc2.textContent=_checkedToday.size;
        toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Check-in failed — try again','err');
        this.search(document.getElementById('kSearch').value);
      }
    } catch(e){
      _checkedToday.delete(sid);
      const _sc1=document.getElementById('kStatChecked');if(_sc1)_sc1.textContent=_checkedToday.size;
      const _sc2=document.getElementById('kStatCheckedSide');if(_sc2)_sc2.textContent=_checkedToday.size;
      toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Connection error','err');
      this.search(document.getElementById('kSearch').value);
    }
  },

  showSuccess(name, sub, student) {
    const today = new Date();
    let isBday = false;
    if(student?.dob){ try{ const d=new Date(student.dob); isBday=d.getMonth()===today.getMonth()&&d.getDate()===today.getDate(); }catch(e){} }
    document.getElementById('sucIcon').textContent = isBday?'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M8 3.5c0-1 1-2 2-1.5s2 .5 2-.5 1-2 2-1.5"/></svg>':'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg>';
    document.getElementById('sucName').textContent = name;
    document.getElementById('sucMsg').textContent = isBday?`Happy Birthday, ${name.split(' ')[0]}!`:sub;
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
      toast('Student deleted','ok');
    } catch(e){ toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Delete failed','err'); }
    hideSaving();
  },

  openFirstTimerFlow() {
    ['ns_name','ns_grade','ns_dob','ns_parent','ns_phone','ns_email','ns_ec','ns_allergy'].forEach(id => {
      document.getElementById(id).value = '';
    });
    document.getElementById('ns_checkin').checked = true;
    const title = document.getElementById('nsModalTitle');
    if (title) { title.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> First Timer / Guest Registration'; title.style.color = '#fcd34d'; }
    const saveBtn = document.getElementById('nsModalSave');
    if (saveBtn) saveBtn.textContent = 'Register & Check In';
    // Always adult fields for first-timer flow
    document.getElementById('ns_grade').placeholder = 'City or full address';
    document.getElementById('ns_parent').placeholder = 'Spouse / family member (optional)';
    openModal('newStudentModal');
  },

  openNewStudent() {
    ['ns_name','ns_grade','ns_dob','ns_parent','ns_phone','ns_email','ns_ec','ns_allergy'].forEach(id=>{
      document.getElementById(id).value='';
    });
    document.getElementById('ns_checkin').checked = true;
    // Reset title in case first-timer flow changed it
    const regLbl = window._kRegLabel || {};
    const title = document.getElementById('nsModalTitle');
    if (title) { title.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 5v14M5 12h14"/></svg> ' + (regLbl.regTitle || 'Register Attendee'); title.style.color = ''; }
    const saveBtn = document.getElementById('nsModalSave');
    if (saveBtn) saveBtn.textContent = regLbl.saveBtn || 'Register & Save';
    // Adapt form fields for youth vs adults
    const gradeLabel  = document.getElementById('nsGradeLabel');
    const parentLabel = document.getElementById('nsParentLabel');
    if(_kEvent === 'Youth Night') {
      if(gradeLabel)  gradeLabel.textContent  = 'Grade';
      if(parentLabel) parentLabel.textContent = 'Parent / Guardian *';
      document.getElementById('ns_grade').placeholder  = 'e.g. 6, 7, 8, 9, 10…';
      document.getElementById('ns_parent').placeholder = 'Parent / Guardian name';
      document.getElementById('ns_allergy').placeholder = 'Allergies or medical notes';
    } else {
      if(gradeLabel)  gradeLabel.textContent  = 'Address';
      if(parentLabel) parentLabel.textContent = 'Spouse / Family Member';
      document.getElementById('ns_grade').placeholder  = 'City or full address';
      document.getElementById('ns_parent').placeholder = 'If applicable';
      document.getElementById('ns_allergy').placeholder = 'Prayer request or notes';
    }
    openModal('newStudentModal');
  },

  async saveNewStudent() {
    const name = document.getElementById('ns_name').value.trim();
    if(!name){toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Name is required','err');return;}
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
        toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> '+(r?.message||r?.error||'Failed to add student'),'err');
      } else {
        closeModal('newStudentModal');
        await this.loadAllStudents();
        if(ci && r?.id) _checkedToday.add(String(r.id));
        this.clearSearch();
        toast(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> ${name} added!`,'ok');
      }
    } catch(e){ toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Connection error','err'); }
    hideSaving();
  },

  async saveEditStudent() {
    const id = document.getElementById('es_id').value;
    const name = document.getElementById('es_name').value.trim();
    if(!name){toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Name is required','err');return;}
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
        toast('<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> Student updated','ok');
      } else toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> '+(r?.error||'Failed to save'),'err');
    } catch(e){ toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Connection error','err'); }
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
      toast('Student deleted','ok');
    } catch(e){ toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Delete failed','err'); }
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
        toast('<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> Leader added','ok');
      } else toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> '+(r?.error||'Failed'),'err');
    } catch(e){ toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Connection error','err'); }
    hideSaving();
  },

  /* ── BATCH ── */
  openBatch() {
    if(!_allStudents.length){ toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> No students loaded yet','err'); return; }
    _batchSelected.clear();
    this.updateBatchUI();
    document.getElementById('batchSearch').value = '';
    // Update batch modal labels based on current event
    const cfg = window._kEventCfg || {};
    const addLbl = cfg.addLbl || 'attendee';
    const selLbl = document.getElementById('batchSelLbl');
    if (selLbl) selLbl.textContent = 'No ' + addLbl.toLowerCase() + 's selected';
    const batchSrch = document.getElementById('batchSearch');
    if (batchSrch) batchSrch.placeholder = 'Search ' + addLbl.toLowerCase() + 's…';
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
    if(!_kLeader){toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Start your session first (select a leader)','err');return;}
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
      const _sc1=document.getElementById('kStatChecked');if(_sc1)_sc1.textContent=_checkedToday.size;
      const _sc2=document.getElementById('kStatCheckedSide');if(_sc2)_sc2.textContent=_checkedToday.size;
      this.search(document.getElementById('kSearch').value);
      toast(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> ${ids.length} students checked in!`,'ok');
    } catch(e){ toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Batch check-in failed — check connection','err'); }
    hideSaving();
  }
};

/* ── KIOSK NAV ── */
function showKiosk() {
  showView('vKiosk');
  // Open event picker immediately — no standalone kiosk state
  const ep = document.getElementById('eventPicker');
  if(ep) ep.classList.add('open');
  // Reset stale state from previous session
  const banner = document.getElementById('kEventBanner');
  if(banner) banner.style.display = 'none';
  const lbox = document.getElementById('kLeaderBox');
  if(lbox) lbox.classList.remove('show');
}
function showDash() { showView('vDash'); }

/* ════════════════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════════════════ */
const DASH = {
  async init() {
    await this.refresh(false);
    clearInterval(_dashTimer);
    // Silent background refresh every 30s — no overlay, no interruption
    _dashTimer = setInterval(()=>this.refresh(true), 30000);
  },

  _ministry: 'all',    // current ministry filter
  _dateFilter: '',     // current date filter (YYYY-MM-DD)
  _rawDash: null,      // last full dashboard data
  _rawCheckins: [],    // all check-ins unfiltered

  async refresh(silent=false) {
    if(!silent) showSaving('Loading…');
    const ministry = this._ministry || 'all';

    // Wait for SESSION token — retry up to 8 times (4 seconds)
    let tok = SESSION?.token || '';
    for(let t=0; !tok && t<8; t++){
      await new Promise(r=>setTimeout(r,500));
      tok = SESSION?.token || '';
      // Also try parent window
      try{ if(!tok && window.parent?.SESSION?.token) { tok=window.parent.SESSION.token; SESSION.token=tok; SESSION.orgId=window.parent.SESSION.orgId||''; } }catch(e){}
    }
    if(!tok){
      if(!silent) { toast('Sign in to view dashboard','err'); hideSaving(); }
      return;
    }

    try {
      if(ministry === 'children') {
        const cm = await API.getCMDash();
        if(cm?.code==='AUTH_REQUIRED'){ if(!silent) toast('Please sign in again','err'); hideSaving(); return; }
        this._rawDash = cm; this._rawCheckins = cm?.checkins||[];
        this.renderCMStats(cm); this.renderBirthdays(cm?.birthdays||[]);
        if(!silent) hideSaving(); return;
      }

      const dash = await API.getDashboard();
      if(dash?.code==='AUTH_REQUIRED'){ if(!silent) toast('Please sign in again','err'); hideSaving(); return; }

      this._rawDash = dash;
      this._rawCheckins = dash?.checkins || [];
      this.applyFilters();
      this.renderBirthdays(dash?.birthdays || []);

      try{ const wk=await API.getWeeklyReport(0); this.renderWeek(wk); }catch(e){ console.warn('Weekly report failed:',e); }
      try{ const ar=await API.getAtRisk(); this.renderAtRisk(ar); }catch(e){ console.warn('At-risk failed:',e); }

      if(ministry==='volunteers') this.loadVolunteerDash();

    } catch(e){
      console.error('DASH.refresh error:', e);
      if(!silent) toast('Dashboard refresh failed','err');
    }
    if(!silent) hideSaving();
  },

  /* ── Ministry switcher ── */
  /* ── Ministry dropdown picker ── */
  toggleEventPicker() {
    const dd = document.getElementById('dashEvtDropdown');
    const arrow = document.getElementById('dashEvtArrow');
    if(!dd) return;

    if(dd.classList.contains('open')) {
      dd.classList.remove('open');
      if(arrow) arrow.classList.remove('open');
      document.removeEventListener('click', DASH._ddClose);
    } else {
      dd.classList.add('open');
      if(arrow) arrow.classList.add('open');
      // One-shot close handler — no setTimeout delay
      DASH._ddClose = (e) => {
        if(!dd.contains(e.target) && e.target.id !== 'dashEvtBtn' && !e.target.closest('#dashEvtBtn')) {
          dd.classList.remove('open');
          if(arrow) arrow.classList.remove('open');
          document.removeEventListener('click', DASH._ddClose);
        }
      };
      // Use requestAnimationFrame to attach after current click bubbles
      requestAnimationFrame(() => document.addEventListener('click', DASH._ddClose));
    }
  },

  pickMinistry(key, icon, label, color, borderColor) {
    // Close dropdown
    const dd = document.getElementById('dashEvtDropdown');
    const arrow = document.getElementById('dashEvtArrow');
    if(dd) dd.classList.remove('open');
    if(arrow) arrow.classList.remove('open');

    this._ministry = key;
    this._analyticsLoaded = false;

    // Update dropdown button label
    const btn = document.getElementById('dashEvtBtn');
    const lbl = document.getElementById('dashEvtLabel');
    if(lbl) lbl.innerHTML = icon + ' <span>' + label + '</span>';
    if(btn) {
      btn.style.borderColor = key === 'all' ? 'var(--teal)' : borderColor;
      btn.style.background  = key === 'all' ? 'rgba(13,148,136,0.12)' : borderColor.replace('0.4)', '0.1)');
      btn.style.color       = color;
    }

    // Update At-Risk tab title
    const atRiskTitleMap = {
      all:        { title:'<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> At-Risk — All Events',       sub:'Attendees with below 50% attendance in the last 8 weeks' },
      sunday:     { title:'<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> At-Risk — Sunday Service',   sub:'Members & guests with low Sunday attendance' },
      youth:      { title:'<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> At-Risk — Youth Night',      sub:'Students with below 50% youth event attendance' },
      youngadult: { title:'<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> At-Risk — Young Adults',     sub:'Young adults with low attendance in the last 8 weeks' },
      smallgroups:{ title:'<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> At-Risk — Small Groups',     sub:'Members missing small group meetings regularly' },
      children:   { title:'<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> At-Risk — Children',         sub:'Children with low check-in frequency' },
      volunteers: { title:'<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> At-Risk — Volunteers',       sub:'Volunteers with infrequent department attendance' },
    };
    const atRisk = atRiskTitleMap[key] || atRiskTitleMap.all;
    const arTitle = document.getElementById('atRiskTitle');
    const arSub   = document.getElementById('atRiskSubtitle');
    if(arTitle) arTitle.textContent = atRisk.title;
    if(arSub)   arSub.textContent   = atRisk.sub;

    // Update analytics week title
    const labelMap = { all:'All Events', sunday:'Sunday Service', youth:'Youth Night',
      youngadult:'Young Adult Ministry', smallgroups:'Small Groups',
      children:"Children's Ministry", volunteers:'Volunteers' };
    const weekHead = document.getElementById('analyticsWeekTitle');
    if(weekHead) weekHead.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> This Week — ' + (labelMap[key]||'All Events');

    // Update stat labels
    this.updateStatLabels(key);

    // Reload data with new filter
    this.applyFilters();

    // Reload active tab with new filter
    const activeTab = document.querySelector('.dash-tab.active');
    if(activeTab) {
      const id = activeTab.id;
      if(id === 'dtAtrisk')     this.loadAtRisk();
      if(id === 'dtAnalytics')  { this._analyticsLoaded = false; this.loadAnalytics(); }
      if(id === 'dtVolunteers') this.loadVolunteerDash();
      // Overview re-renders via applyFilters above — no extra call needed
    }
  },

  // Keep switchMinistry as alias for backward compat
  switchMinistry(key, btn) { this.pickMinistry(key,'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>','All Ministry Events','#fff','var(--rim)'); },

  clearDateFilter() {
    const inp = document.getElementById('dashDateFilter');
    if(inp) inp.value = '';
    this._dateFilter = '';
    this.applyFilters();
  },

  filterByDate(val) {
    this._dateFilter = val;
    this.applyFilters();
  },

  applyFilters() {
    const checkins = this._rawCheckins || [];
    const ministry = this._ministry;
    const dateFilter = this._dateFilter;

    const ministryMap = {
      sunday:     ['Sunday Service','sunday service'],
      youth:      ['Youth Night','youth night','youth'],
      youngadult: ['Young Adult Ministry','young adult','Young Adult'],
      smallgroups:['Small Groups','small groups'],
      children:   ["Children's Ministry","childrens ministry","children"],
      volunteers: ['Worship Team','Ushers & Greeters','Security','Media & Tech','Parking & Traffic','Prayer Team','Hospitality'],
      all:        null
    };

    let filtered = checkins;

    // Ministry filter
    if(ministry !== 'all' && ministryMap[ministry]) {
      const keys = ministryMap[ministry].map(k=>k.toLowerCase());
      filtered = filtered.filter(ci => {
        const ev = (ci.event||ci.type||'').toLowerCase();
        return keys.some(k => ev.includes(k));
      });
    }

    // Date filter
    if(dateFilter) {
      filtered = filtered.filter(ci => {
        const d = ci.time || ci.date || ci.checkinTime || '';
        return d.startsWith(dateFilter);
      });
    }

    // Re-render live feed with filtered data
    this.renderFeed(filtered);

    // ── Compute ALL stats from filtered check-ins ──
    const today = new Date().toISOString().slice(0,10);
    const todayCI = filtered.filter(ci => {
      const d = (ci.time||ci.date||ci.checkinTime||'').slice(0,10);
      return d === today;
    });

    // Today's check-in count (filtered by ministry)
    const todayCount = todayCI.length;

    // New / first-timer count today
    const newCount = todayCI.filter(ci =>
      (ci.type||'').toLowerCase()==='new' || ci.isNew===true || (ci.type||'').toLowerCase()==='first'
    ).length;

    // Unique attendees ever (all-time for this ministry)
    const uniqueNames = new Set(filtered.map(ci => (ci.name||ci.student||'').trim().toLowerCase()).filter(Boolean));
    const totalRegistered = ministry === 'all'
      ? (this._rawDash?.totalStudents ?? uniqueNames.size)
      : uniqueNames.size;

    // Leaders/families — unique leaders in filtered check-ins
    const uniqueLeaders = new Set(
      filtered.filter(ci => (ci.type||ci.role||'').toLowerCase()==='leader')
        .map(ci => (ci.name||ci.leader||'').trim().toLowerCase()).filter(Boolean)
    );
    const leadersCount = ministry === 'all'
      ? (this._rawDash?.totalLeaders ?? uniqueLeaders.size)
      : uniqueLeaders.size;

    // At-risk — from raw dash (always global)
    const atRisk = this._rawDash?.atRisk ?? '—';

    // Volunteers — from volunteer dashboard if that ministry
    const volCount = ministry === 'volunteers'
      ? todayCI.length
      : (this._rawDash?.totalVolunteers ?? '—');

    // Set all stat cards
    const set = (id, v) => { const el=document.getElementById(id); if(el) el.textContent = v??'—'; };
    set('dStatToday',   todayCount);
    set('dStatNew',     newCount);
    set('dStatTotal',   totalRegistered || '0');
    set('dStatLeaders', leadersCount || '0');
    set('dStatRisk',    atRisk);
    const vEl = document.getElementById('dStatGroups');
    if(vEl) vEl.textContent = volCount;

    // Sub-label under Today card
    const subEl = document.getElementById('dStatTodaySub');
    const subLabels = {
      all:'Check-ins today', sunday:'Sunday check-ins', youth:'Youth check-ins',
      youngadult:'YA check-ins', smallgroups:'Group check-ins',
      children:"Children checked in", volunteers:'Volunteers on duty'
    };
    if(subEl) subEl.textContent = subLabels[ministry] || 'Check-ins today';
  },

  updateStatLabels(ministry) {
    const map = {
      all:        { total:'Attendees', leaders:'Leaders',  lbl:'Today',    groups:'Volunteers' },
      sunday:     { total:'Members',   leaders:'Leaders',  lbl:'Sunday',   groups:'Departments' },
      youth:      { total:'Students',  leaders:'Leaders',  lbl:'Youth',    groups:'Groups' },
      youngadult: { total:'Members',   leaders:'Leaders',  lbl:'YA Today', groups:'Groups' },
      smallgroups:{ total:'Members',   leaders:'Leaders',  lbl:'Checked',  groups:'Groups' },
      children:   { total:'Children',  leaders:'Families', lbl:'Checked',  groups:'Families' },
      volunteers: { total:'Volunteers',leaders:'Depts',    lbl:'On Duty',  groups:'Depts' },
    };
    const l = map[ministry] || map.all;
    const set = (id, v) => { const e=document.getElementById(id); if(e) e.textContent=v; };
    set('dLblTotal',   l.total);
    set('dLblLeaders', l.leaders);
    set('dLblToday',   l.lbl);
    set('dLblGroups',  l.groups);
    // Update live feed Members tab label
    const membersTab = document.getElementById('feedTabMembers');
    const tabLabels = {
      all:'Members', sunday:'Members', youth:'Students',
      youngadult:'Adults', smallgroups:'Members',
      children:'Children', volunteers:'Volunteers'
    };
    if(membersTab) membersTab.textContent = tabLabels[ministry] || 'Members';
  },

  renderStats(data, skipTodayNew=false) {
    const set = (id,v) => { const el=document.getElementById(id); if(el) el.textContent=v??'—'; };
    if(!skipTodayNew) {
      set('dStatToday', data?.totalToday ?? data?.checkedIn ?? '—');
      set('dStatNew',   data?.newToday ?? '—');
    }
    set('dStatTodaySub', data?.event || 'Check-ins today');
    set('dStatTotal', data?.totalStudents ?? '—');
    set('dStatLeaders', data?.totalLeaders ?? data?.leadersToday ?? '—');
    set('dStatRisk', data?.atRisk ?? '—');
    const vEl = document.getElementById('dStatGroups');
    if(vEl) vEl.textContent = data?.totalVolunteers ?? '—';
  },

  async loadVolunteerDash() {
    try {
      const r = await API.getVolunteerDashboard();
      if(!r) return;
      const el1 = document.getElementById('vdStatTotal'); if(el1) el1.textContent = r.totalVolunteers||'0';
      const el2 = document.getElementById('vdStatToday'); if(el2) el2.textContent = r.checkedInToday||'0';
      const deptEl = document.getElementById('volDeptPanel');
      if(deptEl && r.departments?.length) {
        const deptColors = {
          'Worship Team':'#ec4899','Ushers & Greeters':'#0891b2','Security':'#dc2626',
          'Media & Tech':'#7c3aed','Parking & Traffic':'#d97706','Prayer Team':'#10b981','Hospitality':'#78716c'
        };
        deptEl.innerHTML = r.departments.map(d => {
          const pct = d.total > 0 ? Math.round((d.checkedIn/d.total)*100) : 0;
          const col = deptColors[d.name] || '#6b7280';
          return `<div style="margin-bottom:12px;padding:10px 14px;background:var(--surface2);border-radius:12px;border:1px solid var(--rim)">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
              <div style="font-size:13px;font-weight:700;color:var(--text)">${d.name}</div>
              <div style="font-size:12px;font-weight:700;color:${col}">${d.checkedIn}/${d.total}</div>
            </div>
            <div style="height:6px;background:var(--rim);border-radius:100px;overflow:hidden">
              <div style="height:100%;width:${pct}%;background:${col};border-radius:100px;transition:width .5s ease"></div>
            </div>
          </div>`;
        }).join('');
      } else if(deptEl) {
        deptEl.innerHTML = '<div class="empty-state"><p class="empty-txt">No volunteers checked in yet</p></div>';
      }
      const recEl = document.getElementById('volRecentPanel');
      if(recEl && r.recentCheckins?.length) {
        const el3 = document.getElementById('volRecentCount'); if(el3) el3.textContent = r.checkedInToday||'0';
        recEl.innerHTML = r.recentCheckins.map(ci =>
          `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--rim)">
            <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#ec4899,#8b5cf6);display:flex;align-items:center;justify-content:center;font-family:var(--font);font-size:11px;font-weight:800;color:#fff;flex-shrink:0">${(ci.name||'?').split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase()}</div>
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;font-weight:700;color:var(--text)">${ci.name||'—'}</div>
              <div style="font-size:11px;color:var(--muted)">${ci.department||''}</div>
            </div>
            <div style="font-size:10px;color:var(--muted2)">${ci.time ? new Date(ci.time).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : ''}</div>
          </div>`
        ).join('');
      } else if(recEl) {
        recEl.innerHTML = '<div class="empty-state"><p class="empty-txt">No check-ins yet today</p></div>';
      }
    } catch(e) { console.error('Volunteer dash error',e); }
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
    // Start from ministry-filtered data
    const ministry = this._ministry || 'all';
    const ministryKeys = {
      sunday:['sunday service'], youth:['youth night','youth'],
      youngadult:['young adult'], smallgroups:['small groups'],
      children:["children's ministry","childrens ministry","children"],
      volunteers:['worship team','ushers','security','media','parking','prayer','hospitality'],
    };
    let data = (this._rawCheckins || []);
    if(ministry !== 'all' && ministryKeys[ministry]) {
      const keys = ministryKeys[ministry];
      data = data.filter(ci => keys.some(k=>(ci.event||ci.type||'').toLowerCase().includes(k)));
    }
    // Apply date filter
    if(this._dateFilter) {
      data = data.filter(ci => (ci.time||ci.date||ci.checkinTime||'').startsWith(this._dateFilter));
    }
    // Today only for the live feed by default
    const today = new Date().toISOString().slice(0,10);
    if(!this._dateFilter) {
      data = data.filter(ci => (ci.time||ci.date||ci.checkinTime||'').slice(0,10) === today);
    }
    if(_feedTab==='students'||_feedTab==='members') data = data.filter(c=>c.type!=='leader'&&c.status!=='leader');
    else if(_feedTab==='leaders') data = data.filter(c=>c.type==='leader'||c.status==='leader');
    else if(_feedTab==='new') data = data.filter(c=>c.isNew||c.firstTime);
    if(q) data = data.filter(c=>(c.name||c.fullName||'').toLowerCase().includes(q.toLowerCase()));

    const el = document.getElementById('feedPanel');
    if(!data.length){
      el.innerHTML=`<div class="empty-state"><div class="empty-icon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6" stroke-width="2.5"/><line x1="3" y1="12" x2="3.01" y2="12" stroke-width="2.5"/><line x1="3" y1="18" x2="3.01" y2="18" stroke-width="2.5"/></svg></div><p class="empty-txt">No check-ins yet for today</p></div>`;
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
      scroll.innerHTML='<div class="bday-empty">No birthdays this week </div>';
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
      el.innerHTML='<div class="empty-state"><div class="empty-icon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg></div><p class="empty-txt">No at-risk students — great attendance!</p></div>';
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
        <div style="font-size:10px;font-weight:800;color:#fca5a5;flex-shrink:0;padding:3px 8px;background:rgba(239,68,68,.1);border-radius:100px;border:1px solid rgba(239,68,68,.25)"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg></div>
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
  if (tab === 'analytics')  DASH.loadAnalytics();
  if (tab === 'atrisk')     { DASH._atRiskLoaded = false; DASH.loadAtRisk(); }
  if (tab === 'lookup')     { /* ready on demand */ }
  if (tab === 'report')     DASH.loadReport(0);
  if (tab === 'volunteers') DASH.loadVolunteerDash();
};

/* ── ANALYTICS TAB ── */
DASH._weekOffset = 0;
DASH._analyticsLoaded = false;

DASH.loadAnalytics = async function() {
  DASH._analyticsLoaded = true;
  DASH.loadWeek(0);
  DASH.loadTrend();
  DASH.loadGrades();
  // Show ministry filter context in analytics header
  const ministry = DASH._ministry || 'all';
  const labelMap = {
    all:'All Events', sunday:'Sunday Service', youth:'Youth Night',
    youngadult:'Young Adult Ministry', smallgroups:'Small Groups',
    children:"Children's Ministry", volunteers:'Volunteers'
  };
  const weekHead = document.getElementById('analyticsWeekTitle');
  if(weekHead) weekHead.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> This Week — ' + (labelMap[ministry]||'All Events');
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
    // Apply ministry filter to daily counts using raw check-ins
    const ministry = DASH._ministry || 'all';
    const ministryKeys = {
      sunday:['sunday service'], youth:['youth night','youth'],
      youngadult:['young adult'], smallgroups:['small groups'],
      children:["children's ministry","children"], volunteers:['worship team','ushers','security','media','parking','prayer','hospitality'],
    };
    const filterKeys = ministry !== 'all' ? (ministryKeys[ministry]||[]) : null;

    const max = Math.max(...days.map(d => {
      let count = d.count||d.total||0;
      if(filterKeys) {
        // Re-count from raw checkins for this day's date
        const dayDate = d.date||d.day||d.label||'';
        const dayCheckins = (DASH._rawCheckins||[]).filter(ci => {
          const ciDate = (ci.time||ci.date||'').substring(0,10);
          const ev = (ci.event||ci.type||'').toLowerCase();
          return (dayDate && (ciDate === dayDate || (d.label||'').includes(ciDate.slice(5))))
            && filterKeys.some(k => ev.includes(k));
        });
        count = dayCheckins.length;
      }
      return count;
    }), 1);

    const colorMap = {
      all:'linear-gradient(90deg,var(--green),var(--teal))',
      sunday:'linear-gradient(90deg,#f59e0b,#fcd34d)',
      youth:'linear-gradient(90deg,#0891b2,#06b6d4)',
      youngadult:'linear-gradient(90deg,#7c3aed,#8b5cf6)',
      smallgroups:'linear-gradient(90deg,#059669,#10b981)',
      children:'linear-gradient(90deg,#10b981,#34d399)',
      volunteers:'linear-gradient(90deg,#be185d,#ec4899)',
    };
    const barColor = colorMap[ministry] || colorMap.all;

    el.innerHTML = `<div style="padding:14px 12px;display:flex;flex-direction:column;gap:11px">${
      days.map(d => {
        let count = d.count||d.total||0;
        if(filterKeys) {
          const dayDate = d.date||d.day||d.label||'';
          const dayCheckins = (DASH._rawCheckins||[]).filter(ci => {
            const ciDate = (ci.time||ci.date||'').substring(0,10);
            const ev = (ci.event||ci.type||'').toLowerCase();
            return (dayDate && (ciDate === dayDate || (d.label||'').includes(ciDate.slice(5))))
              && filterKeys.some(k => ev.includes(k));
          });
          count = dayCheckins.length;
        }
        const label = d.label||d.date||d.day||'';
        const pct = (count/max*100).toFixed(1);
        return `<div style="display:flex;align-items:center;gap:10px">
          <div style="font-size:10px;font-weight:700;color:var(--muted);width:80px;flex-shrink:0;text-align:right">${label}</div>
          <div style="flex:1;height:10px;background:var(--surface);border-radius:5px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:${barColor};border-radius:5px;transition:width .6s .1s ease"></div>
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
  el.innerHTML = '<div class="empty-state" style="padding:40px"><div class="empty-icon">⏳</div><p class="empty-txt">Loading…</p></div>';
  try {
    const r = await API.getAtRisk();
    let students = r?.twoWeeks || r?.atRisk || (Array.isArray(r) ? r : []);

    // Filter by selected ministry
    const ministry = DASH._ministry || 'all';
    const ministryKeys = {
      sunday:['sunday service'], youth:['youth night','youth'],
      youngadult:['young adult'], smallgroups:['small groups'],
      children:["children's ministry","children"],
      volunteers:['worship team','ushers','security','media','parking','prayer','hospitality'],
    };
    if(ministry !== 'all' && ministryKeys[ministry]) {
      const keys = ministryKeys[ministry];
      students = students.filter(s => {
        const ev = (s.lastEvent||s.event||s.type||'').toLowerCase();
        return keys.some(k => ev.includes(k));
      });
    }

    const ministryLabels = { all:'', sunday:' Sunday Service', youth:' Youth Night',
      youngadult:' Young Adults', smallgroups:' Small Groups',
      children:" Children's Ministry", volunteers:' Volunteers' };
    const mLabel = ministryLabels[ministry] || '';

    if (!students.length) {
      el.innerHTML = '<div class="empty-state" style="padding:40px"><div class="empty-icon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg></div>'
        + '<p class="empty-txt">No at-risk attendees for' + mLabel + '</p>'
        + '<p style="font-size:12px;color:var(--muted2);margin-top:6px">Everyone is attending regularly!</p></div>';
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
    el.innerHTML = '<div class="empty-state"><div class="empty-icon"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg></div><p class="empty-txt">Search for a student to see their attendance history</p></div>';
    return;
  }
  const ql = q.toLowerCase();
  const matches = _allStudents.filter(s => (s.name||'').toLowerCase().includes(ql));
  DASH._lookupResults = matches;
  if (!matches.length) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div><p class="empty-txt">No students found matching that name</p></div>';
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
        <div style="width:34px;height:34px;border-radius:50%;background:var(--soft);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg></div>
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

    toast('Report downloaded!', 'ok');
  } catch(e) {
    toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Download failed — try again', 'err');
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
      toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Failed to load families', 'err');
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
        <div class="empty-icon"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg></div>
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
              ${f.phone?`<span>${icon('phone',12)} ${f.phone}</span>`:''}
              ${f.email?`<span>${icon('email',12)} ${f.email}</span>`:''}
              <span style="color:#6ee7b7;font-weight:700">${f.children.length} child${f.children.length!==1?'ren':''}</span>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0">
            ${allChecked?'<div style="background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.4);border-radius:100px;padding:3px 10px;font-size:10px;font-weight:800;color:#6ee7b7"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> All in</div>':''}
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
                  ${cChecked?'<span style="font-size:9px;font-weight:800;background:rgba(16,185,129,.15);color:#6ee7b7;padding:2px 7px;border-radius:100px;border:1px solid rgba(16,185,129,.3)"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> In</span>':''}
                </div>
                <div style="font-size:10px;color:var(--muted);margin-top:2px;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                  ${ch.grade?`<span>Grade ${ch.grade}</span>`:''}
                  ${ch.room?`<span style="background:rgba(6,182,212,.1);color:#67e8f9;padding:1px 7px;border-radius:100px;border:1px solid rgba(6,182,212,.2);font-weight:700">${ch.room}</span>`:''}
                  ${hasAllergy?`<span style="background:rgba(249,115,22,.12);color:#fdba74;padding:1px 7px;border-radius:100px;border:1px solid rgba(249,115,22,.25);font-weight:700"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> ${ch.allergies}</span>`:''}
                </div>
              </div>
              <div style="display:flex;gap:6px;flex-shrink:0" onclick="event.stopPropagation()">
                <button onclick="CM.editChild('${ch.id}','${f.id}')" style="width:28px;height:28px;border-radius:50%;background:var(--surface2);border:1px solid var(--rim);color:var(--muted);cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg></button>
                <button onclick="CM.deleteChildBtn('${ch.id}','${ch.name.replace(/'/,"\\'")}')" style="width:28px;height:28px;border-radius:50%;background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.2);color:#fca5a5;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg></button>
              </div>
            </div>`;
          }).join('')}

          <!-- Family action bar -->
          <div style="display:flex;gap:8px;padding:10px 14px;background:rgba(6,14,16,0.5)">
            <button onclick="CM.checkInAll('${f.id}')" style="flex:1;padding:9px;border-radius:10px;background:rgba(16,185,129,.15);border:1px solid rgba(16,185,129,.35);color:#6ee7b7;font-family:var(--body);font-size:12px;font-weight:800;cursor:pointer"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> Check In All</button>
            <button onclick="CM.openPrint('${f.id}')" style="flex:1;padding:9px;border-radius:10px;background:rgba(6,182,212,.1);border:1px solid rgba(6,182,212,.25);color:#67e8f9;font-family:var(--body);font-size:12px;font-weight:800;cursor:pointer"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7" stroke-width="2.5"/></svg> Name Tags</button>
            <button onclick="CM.addChildToFamily('${f.id}')" style="padding:9px 13px;border-radius:10px;background:var(--surface2);border:1px solid var(--rim);color:var(--muted);font-family:var(--body);font-size:12px;font-weight:700;cursor:pointer">+ Child</button>
            <button onclick="CM.editFamily('${f.id}')" style="padding:9px 13px;border-radius:10px;background:var(--surface2);border:1px solid var(--rim);color:var(--muted);font-family:var(--body);font-size:12px;font-weight:700;cursor:pointer"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg></button>
            <button onclick="CM.deleteFamilyBtn('${f.id}','${f.parentName.replace(/'/,"\\'")}')" style="padding:9px 11px;border-radius:10px;background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.2);color:#fca5a5;font-family:var(--body);font-size:12px;cursor:pointer"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg></button>
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
      toast(`${name} already checked in`, 'ok');
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
      toast(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> ${name} checked in!`, 'ok');
    } catch(e) {
      this._checkedFamilies.delete(childId);
      toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Check-in failed', 'err');
    }
  },

  /* ── CHECK IN ALL CHILDREN IN FAMILY ── */
  async checkInAll(familyId) {
    const family = this._families.find(f => f.id === familyId);
    if (!family || !family.children.length) {
      toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> No children in this family', 'err');
      return;
    }
    showSaving('Checking in family…');
    try {
      await API.checkInFamily(familyId, { leader:_kLeader, event:_kEvent||"Children's Ministry" });
      family.children.forEach(c => this._checkedFamilies.add(c.id));
      const el = document.getElementById('cmStatChecked');
      if (el) el.textContent = this._checkedFamilies.size;
      this.render(this._filtered);
      toast(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> ${family.parentName} family checked in!`, 'ok');
    } catch(e) {
      toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Check-in failed', 'err');
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
    document.getElementById('cmFamilyModalTitle').textContent = 'Register Family';
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
    document.getElementById('cmFamilyModalTitle').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg> Edit Family';
    openModal('cmFamilyModal');
  },

  async saveFamily() {
    const id   = document.getElementById('cmf_id').value;
    const name = document.getElementById('cmf_name').value.trim();
    const phone= document.getElementById('cmf_phone').value.trim();
    if (!name)  { toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Parent name is required', 'err'); return; }
    if (!phone) { toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Phone number is required', 'err'); return; }
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
        toast(id ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> Family updated' : '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> Family registered!', 'ok');
      } else toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> '+(r?.error||'Failed'), 'err');
    } catch(e) { toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Connection error', 'err'); }
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
      toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg> Family deleted', 'ok');
    } catch(e) { toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Delete failed', 'err'); }
    hideSaving();
  },

  /* ── ADD / EDIT CHILD ── */
  addChildToFamily(familyId) {
    const family = this._families.find(f => f.id === familyId);
    document.getElementById('cmc_id').value       = '';
    document.getElementById('cmc_familyId').value = familyId;
    document.getElementById('cmc_familyBadge').textContent = `Family: ${family?.parentName || ''}`;
    ['cmc_first','cmc_last','cmc_grade','cmc_dob','cmc_room','cmc_allergy','cmc_notes'].forEach(id=>{ document.getElementById(id).value=''; });
    document.getElementById('cmChildModalTitle').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 5v14M5 12h14"/></svg> Add Child';
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
    document.getElementById('cmChildModalTitle').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg> Edit Child';
    openModal('cmChildModal');
  },

  async saveChild() {
    const id       = document.getElementById('cmc_id').value;
    const familyId = document.getElementById('cmc_familyId').value;
    const first    = document.getElementById('cmc_first').value.trim();
    if (!first) { toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> First name is required', 'err'); return; }
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
        toast(id ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> Child updated' : '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> Child added!', 'ok');
      } else toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> '+(r?.error||'Failed'), 'err');
    } catch(e) { toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Connection error', 'err'); }
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
      toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg> Child removed', 'ok');
    } catch(e) { toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Delete failed', 'err'); }
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
            ${hasAllergy ? `<div style="background:#fff5f5;border:1.5px solid #ef4444;border-radius:8px;padding:4px 10px;font-size:10px;font-weight:800;color:#dc2626;display:inline-block"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> ${child.allergies}</div>` : ''}
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
              <div style="font-size:12px;font-weight:700;color:#065f46"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> ${family.parentName}</div>
              <div style="font-size:11px;color:#047857;margin-top:2px"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg> ${family.phone}</div>
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

    const today   = new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'});
    const time    = new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});

    // One unique code per child for security matching
    const pages = family.children.map((child, ci) => {
      const secCode   = (Math.random().toString(36).substring(2,6)).toUpperCase();
      const hasAllergy = child.allergies && child.allergies.toLowerCase()!=='none' && child.allergies.trim();
      const grade      = child.grade ? 'Grade ' + child.grade : '';
      const qrId       = 'qr_' + ci;

      const childName = (child.firstName + ' ' + child.lastName).trim();
      const tel = (family.phone || '').replace(/\D/g, '');
      const allergyNote = (child.allergies && child.allergies.toLowerCase() !== 'none' && child.allergies.trim())
        ? ' ALLERGY: ' + child.allergies.trim() + '.' : '';
      const gradeNote = child.grade ? ' (Grade ' + child.grade + ')' : '';
      const roomNote  = child.room  ? ' from ' + child.room : '';

      // SMS URI — pre-filled text message, opens native Messages app on iOS & Android
      // Keep body ASCII-only to ensure QR encoding works on all devices
      const smsBody = 'Hi ' + family.parentName + '! Childrens Ministry here. '
        + 'Please pick up ' + childName + roomNote + gradeNote + '. '
        + 'Pickup code: ' + secCode + '.'
        + allergyNote
        + ' Thank you!';

      const qrURL = 'sms:' + tel + '?body=' + encodeURIComponent(smsBody);

      return (
        // ── PAGE: CHILD TAG (horizontal/landscape) left | right ──
        '<div class="page child-page">'
          + '<div class="tag">'
            // Left section — name & details
            + '<div class="tag-left">'
              + '<div class="tag-ministry">CHILDREN&#39;S MINISTRY</div>'
              + '<div class="tag-firstname">' + child.firstName + '</div>'
              + '<div class="tag-lastname">'  + child.lastName  + '</div>'
              + '<div class="tag-badges">'
                + (child.room ? '<span class="badge-room">'  + child.room + '</span>' : '')
                + (grade      ? '<span class="badge-grade">' + grade      + '</span>' : '')
              + '</div>'
              + (hasAllergy ? '<div class="tag-allergy">&#9888; ' + child.allergies + '</div>' : '')
            + '</div>'
            // Right section — QR + pickup code
            + '<div class="tag-right">'
              + '<div class="tag-scan-lbl">SCAN TO TEXT PARENT</div>'
              + '<div class="qr-wrap" id="' + qrId + '"></div>'
              + '<div class="tag-code-lbl">PICKUP CODE</div>'
              + '<div class="tag-code">' + secCode + '</div>'
            + '</div>'
          + '</div>'
          + '<div class="page-meta">' + today + ' &bull; ' + time + '</div>'
        + '</div>'

        // ── PAGE: PARENT STUB (same size, horizontal) ──
        + '<div class="page parent-page">'
          + '<div class="stub">'
            // Left section — child info
            + '<div class="stub-left">'
              + '<div class="stub-header">SECURITY PICKUP STUB</div>'
              + '<div class="stub-child">' + childName + '</div>'
              + '<div class="stub-detail">' + [child.room, grade].filter(Boolean).join(' &bull; ') + '</div>'
              + '<div class="stub-parent-box">'
                + '<div class="stub-parent-name">&#128100; ' + family.parentName + '</div>'
                + '<div class="stub-parent-phone">&#128222; ' + family.phone + '</div>'
              + '</div>'
              + '<div class="stub-note">Present this stub at pickup. Staff will match the code.</div>'
            + '</div>'
            // Right section — big code
            + '<div class="stub-right">'
              + '<div class="stub-code-lbl">PICKUP CODE</div>'
              + '<div class="stub-code">' + secCode + '</div>'
              + '<div class="stub-date">' + today + '</div>'
            + '</div>'
          + '</div>'
          + '<div class="page-meta">' + time + '</div>'
        + '</div>'

        + '|QR|' + qrId + '|' + JSON.stringify(qrURL) + '|END|'
      );
    });

    // Parse QR metadata
    const qrMeta = [];
    const pagesHTML = pages.map(p => {
      const match = p.match(/\|QR\|([^|]+)\|(.+)\|END\|$/s);
      if (match) qrMeta.push({ id: match[1], url: JSON.parse(match[2]) });
      return p.replace(/\|QR\|.+\|END\|$/s, '');
    }).join('');

    const qrScript = qrMeta.map(q =>
      'new QRCode(document.getElementById(' + JSON.stringify(q.id) + '),{'
      + 'text:' + JSON.stringify(q.url) + ','
      + 'width:88,height:88,'
      + 'colorDark:"#000000",colorLight:"#ffffff",'
      + 'correctLevel:QRCode.CorrectLevel.M'
      + '});'
    ).join('');

    // ── TAG DIMENSIONS: 4" x 2" horizontal label (384px x 192px at 96dpi) ──
    const TW = '400px';
    const TH = '192px';

    const css = [
      '*{box-sizing:border-box;margin:0;padding:0}',
      'html,body{background:#f0f0f0;font-family:Arial,Helvetica,sans-serif}',

      // Page wrapper — one tag centered per printed page
      '.page{width:100%;min-height:100vh;display:flex;flex-direction:column;',
        'align-items:center;justify-content:center;page-break-after:always}',
      '.page-meta{font-size:9px;color:#bbb;margin-top:8px;letter-spacing:0.5px}',

      // ── CHILD TAG — horizontal card ──
      '.tag{width:' + TW + ';height:' + TH + ';background:#fff;border-radius:14px;',
        'overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,.15);display:flex;',
        'border-top:8px solid #10b981}',

      // Left panel (name side)
      '.tag-left{flex:1;padding:12px 14px;display:flex;flex-direction:column;justify-content:center;',
        'border-right:1.5px dashed #d1fae5}',
      '.tag-ministry{font-size:6.5px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;',
        'color:#10b981;margin-bottom:6px}',
      '.tag-firstname{font-size:38px;font-weight:900;color:#111;line-height:1;margin-bottom:1px}',
      '.tag-lastname{font-size:15px;font-weight:700;color:#444;margin-bottom:7px}',
      '.tag-badges{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:5px}',
      '.badge-room{font-size:9px;font-weight:800;padding:2px 9px;border-radius:100px;',
        'background:#ecfdf5;border:1.5px solid #10b981;color:#059669}',
      '.badge-grade{font-size:9px;font-weight:800;padding:2px 9px;border-radius:100px;',
        'background:#eff6ff;border:1.5px solid #3b82f6;color:#1d4ed8}',
      '.tag-allergy{background:#fff5f5;border:1.5px solid #ef4444;border-radius:6px;',
        'padding:3px 9px;font-size:9px;font-weight:800;color:#dc2626;display:inline-block}',

      // Right panel (QR + code side)
      '.tag-right{width:130px;flex-shrink:0;background:#f9fafb;display:flex;flex-direction:column;',
        'align-items:center;justify-content:center;padding:10px 8px;gap:3px}',
      '.tag-scan-lbl{font-size:6px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;',
        'color:#9ca3af;text-align:center}',
      '.qr-wrap{display:flex;align-items:center;justify-content:center}',
      '.tag-code-lbl{font-size:6px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;',
        'color:#9ca3af;text-align:center;margin-top:2px}',
      '.tag-code{font-size:22px;font-weight:900;color:#10b981;letter-spacing:5px;line-height:1}',

      // ── PARENT STUB — same size, same layout ──
      '.stub{width:' + TW + ';height:' + TH + ';background:#fff;border-radius:14px;',
        'overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,.15);display:flex;',
        'border-top:8px solid #10b981;border:3px dashed #10b981}',

      // Stub left (child + parent info)
      '.stub-left{flex:1;padding:12px 14px;display:flex;flex-direction:column;justify-content:center;',
        'border-right:1.5px dashed #d1fae5}',
      '.stub-header{font-size:6.5px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;',
        'color:#9ca3af;margin-bottom:6px}',
      '.stub-child{font-size:22px;font-weight:900;color:#111;line-height:1.1;margin-bottom:2px}',
      '.stub-detail{font-size:10px;color:#666;margin-bottom:7px}',
      '.stub-parent-box{background:#f0fdf4;border-radius:8px;padding:6px 10px;margin-bottom:6px}',
      '.stub-parent-name{font-size:12px;font-weight:700;color:#065f46}',
      '.stub-parent-phone{font-size:11px;color:#047857;margin-top:2px}',
      '.stub-note{font-size:8px;color:#9ca3af;line-height:1.4;font-style:italic}',

      // Stub right (big code)
      '.stub-right{width:130px;flex-shrink:0;background:#064e3b;display:flex;flex-direction:column;',
        'align-items:center;justify-content:center;padding:10px 8px;gap:4px}',
      '.stub-code-lbl{font-size:6.5px;font-weight:800;letter-spacing:2px;text-transform:uppercase;',
        'color:rgba(255,255,255,.6);text-align:center}',
      '.stub-code{font-size:34px;font-weight:900;color:#6ee7b7;letter-spacing:5px;line-height:1}',
      '.stub-date{font-size:8px;color:rgba(255,255,255,.4);text-align:center;margin-top:2px}',

      // Print
      '@media print{',
        'html,body{background:#fff}',
        '.page{min-height:100vh}',
        '.page-meta{display:none}',
        '.tag,.stub{box-shadow:none}',
        '.tag{border:1.5px solid #10b981;border-top:8px solid #10b981}',
      '}',
    ].join('');

    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) { toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Allow pop-ups to print tags','err'); return; }

    // Write HTML without inline scripts to avoid escaping issues
    const fullHTML = '<!DOCTYPE html><html><head>'
      + '<meta charset="utf-8">'
      + '<title>Name Tags</title>'
      + '<style>' + css + '</style>'
      + '</head><body>'
      + pagesHTML
      + '</body></html>';

    win.document.open();
    win.document.write(fullHTML);
    win.document.close();

    // Inject QRCode lib after DOM is written
    const qrLib = win.document.createElement('script');
    qrLib.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    qrLib.onload = function() {
      win.setTimeout(function() {
        qrMeta.forEach(function(q) {
          const el = win.document.getElementById(q.id);
          if (!el) return;
          el.innerHTML = '';
          new win.QRCode(el, {
            text: q.url,
            width: 96,
            height: 96,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: win.QRCode.CorrectLevel.M
          });
        });
        win.setTimeout(function() { win.print(); }, 900);
      }, 150);
    };
    qrLib.onerror = function() {
      win.setTimeout(function() { win.print(); }, 500);
      toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> QR library failed to load', 'err');
    };
    win.document.head.appendChild(qrLib);

    closeModal('cmPrintModal');
    toast('\uD83D\uDDA8\uFE0F Opening print preview\u2026', 'ok');
  }
};


CM.printAllTags = function() {
  const checked = this._families.filter(f=>f.children.some(ch=>this._checkedFamilies.has(ch.id)));
  if (!checked.length) { toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> No checked-in children yet','err'); return; }
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
        +   (hasAllergy?'<div class="tal"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> '+child.allergies+'</div>':'')
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
  win.document.write('<!DOCTYPE html><html><head><title>Name Tags</title><style>'+css+'</style></head><body><h2>Children\'s Ministry · '+total+' children · '+today+'</h2><div class="grid">'+tagsHTML+'</div><scr'+'ipt>window.onload=function(){window.print()}<'+'/scr'+'ipt></body></html>');
  win.document.close();
  toast('Printing name tags','ok');
};

function showCM() { showView('vCM'); CM.load(); }
KIOSK.selectCM = function(el) { KIOSK.selectEvent(el, "Childrens Ministry", '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>', "Childrens church check-in"); };

/* ════════════════════════════════════════════════════
   VOLUNTEER MODULE
════════════════════════════════════════════════════ */
const VOL = {
  _department: '',
  _volunteers: [],
  _filtered: [],
  _checkedIn: new Set(),
  _departments: [],

  /* ── OPEN ── */
  async open(department, icon) {
    this._department = department;
    this._checkedIn.clear();
    showView('vVolunteers');
    // Set header
    const t = document.getElementById('volDeptTitle');
    if (t) t.textContent = (icon||'') + ' ' + (department||'VOLUNTEERS').toUpperCase();
    const deptStat = document.getElementById('volStatDept');
    if (deptStat) deptStat.textContent = department ? department.split(' ')[0] : 'All';
    await this.load();
  },

  async load() {
    showSaving('Loading volunteers…');
    try {
      const r = await API.getVolunteers(this._department);
      this._volunteers = r?.volunteers || [];
      this._filtered = [...this._volunteers];
      this.updateStats();
      this.render(this._filtered);
    } catch(e) { toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Failed to load volunteers','err'); }
    hideSaving();
  },

  updateStats() {
    const el = document.getElementById('volStatTotal');
    if (el) el.textContent = this._volunteers.length;
    const el2 = document.getElementById('volStatChecked');
    if (el2) el2.textContent = this._checkedIn.size;
  },

  search(q) {
    document.getElementById('volClear').classList.toggle('show', q.length > 0);
    if (!q.trim()) { this._filtered = [...this._volunteers]; }
    else {
      const ql = q.toLowerCase();
      this._filtered = this._volunteers.filter(v =>
        (v.name||'').toLowerCase().includes(ql) ||
        (v.role||'').toLowerCase().includes(ql) ||
        (v.department||'').toLowerCase().includes(ql)
      );
    }
    this.render(this._filtered);
  },

  clearSearch() {
    document.getElementById('volSearch').value = '';
    document.getElementById('volClear').classList.remove('show');
    this._filtered = [...this._volunteers];
    this.render(this._filtered);
  },

  render(vols) {
    const el = document.getElementById('volList');
    if (!vols.length) {
      el.innerHTML = `<div class="empty-state" style="padding:60px 20px">
        <div class="empty-icon">${this._volunteers.length ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'}</div>
        <div class="k-empty-title">${this._volunteers.length ? 'No volunteers match' : 'No volunteers registered'}</div>
        <div class="k-empty-sub">${this._volunteers.length ? 'Try a different name' : 'Tap <strong>+ Volunteer</strong> to add your first volunteer'}</div>
      </div>`;
      return;
    }

    el.innerHTML = vols.map((v, i) => {
      const isIn = this._checkedIn.has(v.id);
      const init = initials(v.name);
      const deptColor = this._getDeptColor(v.department);
      return `<div style="background:var(--ink2);border:2px solid ${isIn ? deptColor.border : 'var(--rim)'};border-radius:18px;margin-bottom:10px;overflow:hidden;animation:fadeUp .2s ease both;animation-delay:${Math.min(i,6)*0.04}s;transition:border-color .2s;${isIn ? `background:${deptColor.bg}` : ''}">
        <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;cursor:pointer" onclick="VOL.checkIn('${v.id}','${v.name.replace(/'/,"\\'")}')">
          <div style="width:46px;height:46px;border-radius:50%;background:${isIn ? deptColor.border : gradientForName(v.name)};display:flex;align-items:center;justify-content:center;font-family:var(--font);font-size:15px;font-weight:800;color:#fff;flex-shrink:0;transition:background .2s">${init}</div>
          <div style="flex:1;min-width:0">
            <div style="font-family:var(--font);font-size:15px;font-weight:800;color:${isIn ? deptColor.text : 'var(--text)'};margin-bottom:3px;display:flex;align-items:center;gap:6px">
              ${v.name}
              ${isIn ? '<span style="font-size:9px;font-weight:800;background:rgba(255,255,255,0.15);color:#fff;padding:2px 8px;border-radius:100px;border:1px solid rgba(255,255,255,0.3)"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> IN</span>' : ''}
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:5px">
              ${v.role ? `<span style="font-size:10px;font-weight:700;background:${deptColor.bg};color:${deptColor.text};padding:2px 8px;border-radius:100px;border:1px solid ${deptColor.border}">${v.role}</span>` : ''}
              ${v.department ? `<span style="font-size:10px;font-weight:600;color:var(--muted)">${v.department}</span>` : ''}
              ${v.phone ? `<span style="font-size:10px;color:var(--muted2)"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg> ${v.phone}</span>` : ''}
            </div>
          </div>
          <div style="display:flex;gap:5px;flex-shrink:0" onclick="event.stopPropagation()">
            <button onclick="VOL.editVol('${v.id}')" style="width:30px;height:30px;border-radius:8px;background:var(--surface2);border:1px solid var(--rim);color:var(--muted);cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg></button>
            <button onclick="VOL.deleteVol('${v.id}','${v.name.replace(/'/,"\\'")}')" style="width:30px;height:30px;border-radius:8px;background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2);color:#fca5a5;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg></button>
          </div>
        </div>
      </div>`;
    }).join('');
  },

  _getDeptColor(dept) {
    const map = {
      'Worship Team':       { bg:'rgba(236,72,153,0.1)', border:'rgba(236,72,153,0.5)', text:'#f9a8d4' },
      'Ushers & Greeters':  { bg:'rgba(8,145,178,0.1)',  border:'rgba(8,145,178,0.5)',  text:'#67e8f9' },
      'Security':           { bg:'rgba(220,38,38,0.1)',  border:'rgba(220,38,38,0.5)',  text:'#fca5a5' },
      'Media & Tech':       { bg:'rgba(124,58,237,0.1)', border:'rgba(124,58,237,0.5)', text:'#c4b5fd' },
      'Parking & Traffic':  { bg:'rgba(217,119,6,0.1)',  border:'rgba(217,119,6,0.5)',  text:'#fcd34d' },
      'Prayer Team':        { bg:'rgba(16,185,129,0.1)', border:'rgba(16,185,129,0.5)', text:'#6ee7b7' },
      'Hospitality':        { bg:'rgba(120,113,108,0.1)',border:'rgba(120,113,108,0.5)',text:'#d6d3d1' },
    };
    return map[dept] || { bg:'rgba(100,116,139,0.1)', border:'rgba(100,116,139,0.4)', text:'var(--muted)' };
  },

  async checkIn(volId, name) {
    if (this._checkedIn.has(volId)) { toast(`${name} already checked in`,'ok'); return; }
    this._checkedIn.add(volId);
    this.updateStats();
    this.render(this._filtered);
    try {
      const r = await API.checkInVolunteer(volId, { event: _kEvent||this._department, leader: _kLeader });
      if (!r?.success) { this._checkedIn.delete(volId); this.updateStats(); this.render(this._filtered); toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Check-in failed','err'); return; }
      toast(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> ${name} checked in!`,'ok');
    } catch(e) { this._checkedIn.delete(volId); this.updateStats(); this.render(this._filtered); toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Connection error','err'); }
  },

  async batchCheckInAll() {
    const unchecked = this._volunteers.filter(v => !this._checkedIn.has(v.id));
    if (!unchecked.length) { toast('<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> All volunteers already checked in','ok'); return; }
    if (!confirm(`Check in all ${unchecked.length} volunteers in this department?`)) return;
    showSaving(`Checking in ${unchecked.length} volunteers…`);
    let done = 0;
    for (const v of unchecked) {
      try {
        const r = await API.checkInVolunteer(v.id, { event: _kEvent||this._department, leader: _kLeader });
        if (r?.success) { this._checkedIn.add(v.id); done++; }
      } catch(e){}
    }
    this.updateStats(); this.render(this._filtered);
    hideSaving();
    toast(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> ${done} volunteers checked in!`,'ok');
  },

  /* ── ADD / EDIT ── */
  openAddVolunteer() {
    document.getElementById('vol_id').value = '';
    ['vol_first','vol_last','vol_phone','vol_email','vol_role','vol_notes'].forEach(id => { document.getElementById(id).value=''; });
    document.getElementById('vol_dept').value = this._department || '';
    document.getElementById('volModalTitle').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 5v14M5 12h14"/></svg> Add Volunteer';
    openModal('volModal');
  },

  editVol(id) {
    const v = this._volunteers.find(v => v.id === id);
    if (!v) return;
    document.getElementById('vol_id').value    = v.id;
    document.getElementById('vol_first').value = v.firstName||'';
    document.getElementById('vol_last').value  = v.lastName||'';
    document.getElementById('vol_phone').value = v.phone||'';
    document.getElementById('vol_email').value = v.email||'';
    document.getElementById('vol_dept').value  = v.department||'';
    document.getElementById('vol_role').value  = v.role||'';
    document.getElementById('vol_notes').value = v.notes||'';
    document.getElementById('volModalTitle').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg> Edit Volunteer';
    openModal('volModal');
  },

  async save() {
    const id    = document.getElementById('vol_id').value;
    const first = document.getElementById('vol_first').value.trim();
    const dept  = document.getElementById('vol_dept').value;
    if (!first) { toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> First name is required','err'); return; }
    const data = { firstName:first, lastName:document.getElementById('vol_last').value.trim(),
      phone:document.getElementById('vol_phone').value.trim(), email:document.getElementById('vol_email').value.trim(),
      department:dept, role:document.getElementById('vol_role').value.trim(),
      notes:document.getElementById('vol_notes').value.trim() };
    showSaving(id ? 'Updating…' : 'Adding volunteer…');
    try {
      const r = id ? await API.editVolunteer(id, data) : await API.addVolunteer(data);
      if (r?.success) {
        closeModal('volModal');
        await this.load();
        toast(id ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> Volunteer updated' : '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> Volunteer added!','ok');
      } else toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> '+(r?.error||'Failed'),'err');
    } catch(e) { toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Connection error','err'); }
    hideSaving();
  },

  async deleteVol(id, name) {
    if (!confirm(`Remove ${name}? This cannot be undone.`)) return;
    showSaving('Removing…');
    try {
      await API.deleteVolunteer(id);
      await this.load();
      toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg> Volunteer removed','ok');
    } catch(e) { toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Delete failed','err'); }
    hideSaving();
  },

  /* ── DEPARTMENTS ── */
  async openDeptManager() {
    openModal('deptModal');
    await this.loadDepts();
  },

  async loadDepts() {
    try {
      const r = await API.getDepartments();
      this._departments = r?.departments || [];
      const list = document.getElementById('deptList');
      if (!list) return;
      list.innerHTML = this._departments.map(d =>
        `<div style="display:flex;align-items:center;gap:10px;background:var(--ink2);border:1px solid var(--rim);border-radius:12px;padding:10px 14px">
          <div style="font-size:20px">${d.icon||'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7" stroke-width="2.5"/></svg>'}</div>
          <div style="flex:1;font-size:13px;font-weight:600">${d.name}</div>
          <button onclick="VOL.deleteDept('${d.id}','${d.name.replace(/'/,"\\'")}')" style="width:28px;height:28px;border-radius:8px;background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.2);color:#fca5a5;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg></button>
        </div>`
      ).join('') || '<div class="empty-state"><p class="empty-txt">No departments found</p></div>';
    } catch(e) {}
  },

  async addDept() {
    const name = document.getElementById('newDeptInput').value.trim();
    if (!name) { toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Enter a department name','err'); return; }
    try {
      const r = await API.addDepartment(name, '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7" stroke-width="2.5"/></svg>', '#6b7280');
      if (r?.success) {
        document.getElementById('newDeptInput').value = '';
        await this.loadDepts();
        // Also add to vol_dept select
        const sel = document.getElementById('vol_dept');
        if (sel) {
          const opt = document.createElement('option');
          opt.value = name; opt.textContent = name;
          sel.appendChild(opt);
        }
        toast('<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> Department added','ok');
      }
    } catch(e) { toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Failed','err'); }
  },

  async deleteDept(id, name) {
    if (!confirm(`Delete "${name}" department?`)) return;
    try {
      await API.deleteDepartment(id);
      await this.loadDepts();
      toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg> Department deleted','ok');
    } catch(e) { toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Failed','err'); }
  }
};

/* ── KIOSK: dept picker ── */
// Dept picker removed — volunteer depts now accessed via home card

/* ── KIOSK: selectVolunteer ── */
let _kEventType = 'general';

// Add Volunteers option to home card and update API

/* ════════════════════════════════════════════════════
   SMALL GROUPS MODULE
════════════════════════════════════════════════════ */
const SG = {
  _groups: [],
  _filtered: [],
  _checkedGroups: new Set(),

  async open() {
    showView('vSmallGroups');
    await this.load();
  },

  async load() {
    showSaving('Loading groups…');
    try {
      const r = await API.getSmallGroups();
      this._groups = r?.groups || [];
      this._filtered = [...this._groups];
      this.updateStats();
      this.render(this._filtered);
    } catch(e) { toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Failed to load groups','err'); }
    hideSaving();
  },

  updateStats() {
    const totalMembers = this._groups.reduce((a,g)=>a+g.members.length,0);
    const el1 = document.getElementById('sgStatGroups');
    const el2 = document.getElementById('sgStatMembers');
    if(el1) el1.textContent = this._groups.length;
    if(el2) el2.textContent = totalMembers;
  },

  search(q) {
    document.getElementById('sgClear').classList.toggle('show', q.length>0);
    if (!q.trim()) { this._filtered = [...this._groups]; }
    else {
      const ql = q.toLowerCase();
      this._filtered = this._groups.filter(g=>
        g.name.toLowerCase().includes(ql) ||
        g.leader.toLowerCase().includes(ql) ||
        g.category.toLowerCase().includes(ql)
      );
    }
    this.render(this._filtered);
  },

  clearSearch() {
    document.getElementById('sgSearch').value = '';
    document.getElementById('sgClear').classList.remove('show');
    this._filtered = [...this._groups];
    this.render(this._filtered);
  },

  render(groups) {
    const el = document.getElementById('sgGroupList');
    if (!groups.length) {
      el.innerHTML = `<div class="empty-state" style="padding:60px 20px">
        <div class="empty-icon">${this._groups.length?'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>':'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>'}</div>
        <div class="k-empty-title">${this._groups.length?'No groups match':'No small groups yet'}</div>
        <div class="k-empty-sub">${this._groups.length?'Try a different search':'Tap <strong>+ Group</strong> to create your first small group'}</div>
      </div>`;
      return;
    }
    const roleColors = { Leader:'rgba(245,158,11,0.2)', 'Co-Leader':'rgba(139,92,246,0.2)', Host:'rgba(6,182,212,0.2)', Guest:'rgba(148,163,184,0.1)', Member:'' };
    const roleText   = { Leader:'#fcd34d','Co-Leader':'#c4b5fd', Host:'#67e8f9', Guest:'rgba(148,163,184,0.8)', Member:'var(--muted)' };

    el.innerHTML = groups.map((g,gi)=>{
      const isChecked = this._checkedGroups.has(g.id);
      return `<div style="background:var(--ink2);border:2px solid ${isChecked?'rgba(16,185,129,0.5)':'var(--rim)'};border-radius:22px;margin-bottom:12px;overflow:hidden;animation:fadeUp .2s ease both;animation-delay:${Math.min(gi,5)*0.05}s">
        <!-- Group header -->
        <div style="display:flex;align-items:center;gap:12px;padding:16px 18px;cursor:pointer" onclick="SG.toggleGroup('${g.id}')">
          <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#0d9488,#06b6d4);display:flex;align-items:center;justify-content:center;font-family:var(--font);font-size:15px;font-weight:900;color:#fff;flex-shrink:0;box-shadow:0 0 18px rgba(13,148,136,0.3)">${initials(g.name)}</div>
          <div style="flex:1;min-width:0">
            <div style="font-family:var(--font);font-size:16px;font-weight:900;color:#fff;margin-bottom:3px">${g.name}</div>
            <div style="display:flex;flex-wrap:wrap;gap:7px;align-items:center">
              ${g.leader?`<span style="font-size:11px;color:#6ee7b7;font-weight:700"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> ${g.leader}</span>`:''}
              ${g.day?`<span style="font-size:10px;color:var(--muted)">${g.day}${g.time?' · '+g.time:''}</span>`:''}
              ${g.category?`<span style="font-size:10px;font-weight:700;background:rgba(13,148,136,0.12);color:#6ee7b7;padding:2px 8px;border-radius:100px;border:1px solid rgba(13,148,136,0.25)">${g.category}</span>`:''}
              <span style="font-size:10px;font-weight:700;background:rgba(6,182,212,0.1);color:#67e8f9;padding:2px 8px;border-radius:100px">${g.members.length} member${g.members.length!==1?'s':''}</span>
              ${isChecked?'<span style="font-size:10px;font-weight:800;background:rgba(16,185,129,0.15);color:#6ee7b7;padding:2px 8px;border-radius:100px;border:1px solid rgba(16,185,129,0.3)"><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> Checked In</span>':''}
            </div>
          </div>
          <div style="font-size:20px;color:var(--muted2);flex-shrink:0" id="sgArrow_${g.id}">›</div>
        </div>

        <!-- Expanded members + actions -->
        <div id="sgBody_${g.id}" style="display:none;border-top:1px solid rgba(13,148,136,0.12)">
          ${g.location?`<div style="padding:8px 18px;font-size:11px;color:var(--muted);border-bottom:1px solid var(--rim)">${icon('location',12)} ${g.location}</div>`:''}
          ${g.notes?`<div style="padding:8px 18px;font-size:11px;color:var(--muted2);border-bottom:1px solid var(--rim);font-style:italic">${g.notes}</div>`:''}

          ${g.members.length===0
            ? `<div style="padding:14px 18px;text-align:center;font-size:12px;color:var(--muted)">No members yet — add one below</div>`
            : g.members.map(m=>{
              const rc = roleColors[m.role]||'';
              const rt = roleText[m.role]||'var(--muted)';
              return `<div style="display:flex;align-items:center;gap:11px;padding:11px 18px;border-bottom:1px solid rgba(13,148,136,0.07)">
                <div style="width:36px;height:36px;border-radius:10px;background:${rc||'var(--surface2)'};display:flex;align-items:center;justify-content:center;font-family:var(--font);font-size:11px;font-weight:800;color:${rt};flex-shrink:0;border:1px solid ${rc?rt.replace('0.2','0.4'):'var(--rim)'}">${initials(m.name)}</div>
                <div style="flex:1;min-width:0">
                  <div style="font-size:13px;font-weight:700;color:#fff;display:flex;align-items:center;gap:6px">
                    ${m.name}
                    ${m.role!=='Member'?`<span style="font-size:9px;font-weight:800;padding:2px 7px;border-radius:100px;background:${rc};color:${rt};border:1px solid ${rt.replace('var(--muted)','rgba(148,163,184,0.3)')}">${m.role}</span>`:''}
                  </div>
                  <div style="font-size:10px;color:var(--muted);margin-top:2px">${m.phone||''} ${m.email?'· '+m.email:''}</div>
                </div>
                <div style="display:flex;gap:4px;flex-shrink:0">
                  <button onclick="SG.editMember('${m.id}','${g.id}')" style="width:28px;height:28px;border-radius:8px;background:var(--surface2);border:1px solid var(--rim);color:var(--muted);cursor:pointer;font-size:11px;display:flex;align-items:center;justify-content:center"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg></button>
                  <button onclick="SG.deleteMember('${m.id}','${m.name.replace(/'/,"\\'")}')" style="width:28px;height:28px;border-radius:8px;background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.2);color:#fca5a5;cursor:pointer;font-size:11px;display:flex;align-items:center;justify-content:center"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg></button>
                </div>
              </div>`;
            }).join('')}

          <!-- Group actions bar -->
          <div style="display:flex;gap:7px;padding:11px 16px;background:rgba(6,14,16,0.4)">
            <button onclick="SG.checkInAll('${g.id}')" style="flex:1;padding:9px;border-radius:11px;background:rgba(13,148,136,0.15);border:1px solid rgba(13,148,136,0.4);color:#6ee7b7;font-family:var(--body);font-size:12px;font-weight:800;cursor:pointer"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> Check In All</button>
            <button onclick="SG.addMemberToGroup('${g.id}','${g.name.replace(/'/,"\\'")}')" style="padding:9px 13px;border-radius:11px;background:rgba(13,148,136,0.08);border:1px solid rgba(13,148,136,0.2);color:#6ee7b7;font-family:var(--body);font-size:12px;font-weight:700;cursor:pointer">+ Member</button>
            <button onclick="SG.editGroup('${g.id}')" style="padding:9px 11px;border-radius:11px;background:var(--surface2);border:1px solid var(--rim);color:var(--muted);font-family:var(--body);font-size:12px;cursor:pointer"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg></button>
            <button onclick="SG.deleteGroup('${g.id}','${g.name.replace(/'/,"\\'")}')" style="padding:9px 11px;border-radius:11px;background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.2);color:#fca5a5;font-family:var(--body);font-size:12px;cursor:pointer"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg></button>
          </div>
        </div>
      </div>`;
    }).join('');
  },

  toggleGroup(id) {
    const body = document.getElementById(`sgBody_${id}`);
    const arrow = document.getElementById(`sgArrow_${id}`);
    if (!body) return;
    const open = body.style.display === 'none';
    body.style.display = open ? 'block' : 'none';
    if (arrow) arrow.textContent = open ? '⌄' : '›';
  },

  /* ── CHECK IN ── */
  async checkInAll(groupId) {
    const group = this._groups.find(g=>g.id===groupId);
    if (!group || !group.members.length) { toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> No members in this group','err'); return; }
    showSaving('Checking in group…');
    try {
      const r = await API.checkInSGGroup(groupId, { leader:_kLeader, event:_kEvent||'Small Groups' });
      if (r?.success) {
        this._checkedGroups.add(groupId);
        const el2 = document.getElementById('sgStatChecked');
        if (el2) el2.textContent = parseInt(el2.textContent||0) + (r.count||group.members.length);
        this.render(this._filtered);
        toast(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> ${group.name} — ${r.count||group.members.length} members checked in!`,'ok');
      } else toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> '+(r?.error||'Check-in failed'),'err');
    } catch(e) { toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Connection error','err'); }
    hideSaving();
  },

  /* ── ADD / EDIT GROUP ── */
  openAddGroup() {
    document.getElementById('sg_id').value = '';
    ['sg_name','sg_leader','sg_leader_phone','sg_time','sg_location','sg_notes'].forEach(id=>{ document.getElementById(id).value=''; });
    document.getElementById('sg_day').value = '';
    document.getElementById('sg_category').value = '';
    document.getElementById('sgGroupModalTitle').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg> Create Small Group';
    openModal('sgGroupModal');
  },

  editGroup(groupId) {
    const g = this._groups.find(g=>g.id===groupId);
    if (!g) return;
    document.getElementById('sg_id').value = g.id;
    document.getElementById('sg_name').value = g.name;
    document.getElementById('sg_leader').value = g.leader;
    document.getElementById('sg_leader_phone').value = g.leaderPhone;
    document.getElementById('sg_day').value = g.day;
    document.getElementById('sg_time').value = g.time;
    document.getElementById('sg_location').value = g.location;
    document.getElementById('sg_category').value = g.category;
    document.getElementById('sg_notes').value = g.notes;
    document.getElementById('sgGroupModalTitle').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg> Edit Group';
    openModal('sgGroupModal');
  },

  async saveGroup() {
    const id   = document.getElementById('sg_id').value;
    const name = document.getElementById('sg_name').value.trim();
    const leader = document.getElementById('sg_leader').value.trim();
    if (!name)  { toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Group name is required','err'); return; }
    if (!leader){ toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Leader name is required','err'); return; }
    const data = { name, leader, leaderPhone:document.getElementById('sg_leader_phone').value.trim(),
      day:document.getElementById('sg_day').value, time:document.getElementById('sg_time').value.trim(),
      location:document.getElementById('sg_location').value.trim(),
      category:document.getElementById('sg_category').value, notes:document.getElementById('sg_notes').value.trim() };
    showSaving(id?'Updating group…':'Creating group…');
    try {
      let r;
      if (id) {
        r = await API.editSmallGroup(id, data);
        if (r?.success) { const g=this._groups.find(g=>g.id===id); if(g) Object.assign(g,data); }
      } else {
        r = await API.addSmallGroup(data);
        if (r?.success) this._groups.unshift({ ...data, id:r.id, members:[] });
      }
      if (r?.success) {
        closeModal('sgGroupModal');
        this._filtered = [...this._groups];
        this.updateStats();
        this.render(this._filtered);
        toast(id?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> Group updated':'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> Group created!','ok');
      } else toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> '+(r?.error||'Failed'),'err');
    } catch(e) { toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Connection error','err'); }
    hideSaving();
  },

  async deleteGroup(id, name) {
    if (!confirm(`Delete "${name}" and all its members? This cannot be undone.`)) return;
    showSaving('Deleting…');
    try {
      await API.deleteSmallGroup(id);
      this._groups = this._groups.filter(g=>g.id!==id);
      this._filtered = this._filtered.filter(g=>g.id!==id);
      this.updateStats(); this.render(this._filtered);
      toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg> Group deleted','ok');
    } catch(e) { toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Delete failed','err'); }
    hideSaving();
  },

  /* ── MEMBERS ── */
  addMemberToGroup(groupId, groupName) {
    document.getElementById('sgm_group_id').value = groupId;
    document.getElementById('sgm_member_id').value = '';
    document.getElementById('sgMemberGroupBadge').textContent = `Group: ${groupName}`;
    document.getElementById('sgMemberModalTitle').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 5v14M5 12h14"/></svg> Add Member';
    ['sgm_first','sgm_last','sgm_phone','sgm_email'].forEach(id=>{ document.getElementById(id).value=''; });
    document.getElementById('sgm_role').value = 'Member';
    openModal('sgMemberModal');
  },

  editMember(memberId, groupId) {
    const group = this._groups.find(g=>g.id===groupId);
    const m = group?.members.find(m=>m.id===memberId);
    if (!m) return;
    document.getElementById('sgm_group_id').value = groupId;
    document.getElementById('sgm_member_id').value = memberId;
    document.getElementById('sgMemberGroupBadge').textContent = `Group: ${group.name}`;
    document.getElementById('sgMemberModalTitle').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg> Edit Member';
    document.getElementById('sgm_first').value = m.firstName;
    document.getElementById('sgm_last').value  = m.lastName;
    document.getElementById('sgm_phone').value = m.phone;
    document.getElementById('sgm_email').value = m.email;
    document.getElementById('sgm_role').value  = m.role;
    openModal('sgMemberModal');
  },

  async saveMember() {
    const gid  = document.getElementById('sgm_group_id').value;
    const mid  = document.getElementById('sgm_member_id').value;
    const first = document.getElementById('sgm_first').value.trim();
    if (!first) { toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> First name required','err'); return; }
    const group = this._groups.find(g=>g.id===gid);
    const data = { groupId:gid, groupName:group?.name||'',
      firstName:first, lastName:document.getElementById('sgm_last').value.trim(),
      phone:document.getElementById('sgm_phone').value.trim(),
      email:document.getElementById('sgm_email').value.trim(),
      role:document.getElementById('sgm_role').value };
    showSaving(mid?'Updating…':'Adding member…');
    try {
      let r;
      if (mid) {
        r = await API.editSGMember(mid, data);
        if (r?.success && group) {
          const m = group.members.find(m=>m.id===mid);
          if (m) { Object.assign(m, { firstName:data.firstName, lastName:data.lastName,
            name:(data.firstName+' '+data.lastName).trim(), phone:data.phone,
            email:data.email, role:data.role }); }
        }
      } else {
        r = await API.addSGMember(data);
        if (r?.success && group) group.members.push({ id:r.id, groupId:gid,
          firstName:data.firstName, lastName:data.lastName,
          name:(data.firstName+' '+data.lastName).trim(),
          phone:data.phone, email:data.email, role:data.role });
      }
      if (r?.success) {
        closeModal('sgMemberModal');
        this.updateStats(); this.render(this._filtered);
        setTimeout(()=>{ const b=document.getElementById(`sgBody_${gid}`); if(b) b.style.display='block';
          const a=document.getElementById(`sgArrow_${gid}`); if(a) a.textContent='⌄'; }, 50);
        toast(mid?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> Member updated':'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> Member added!','ok');
      } else toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> '+(r?.error||'Failed'),'err');
    } catch(e) { toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Connection error','err'); }
    hideSaving();
  },

  async deleteMember(memberId, name) {
    if (!confirm(`Remove ${name}?`)) return;
    showSaving('Removing…');
    try {
      await API.deleteSGMember(memberId);
      this._groups.forEach(g=>{ g.members=g.members.filter(m=>m.id!==memberId); });
      this.updateStats(); this.render(this._filtered);
      toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg> Member removed','ok');
    } catch(e) { toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Delete failed','err'); }
    hideSaving();
  }
};

/* ── Route Small Groups from event picker ── */
function showSmallGroups() { showView('vSmallGroups'); SG.open(); }

// Young Adult Ministry — update banner and actions
const _origBannerConfig = {
  'Young Adult Ministry': { bg:'rgba(139,92,246,0.1)', border:'rgba(139,92,246,0.35)', color:'#c4b5fd', title:'Young Adult Ministry', desc:'Ages 18–35 — check in, register new members & guests', icon:icon('firstTimer',18) }
};

/* ════════════════════════════════════════════════════
   SINGLE UNIFIED confirmEvent — handles all 4 events
════════════════════════════════════════════════════ */
/* confirmEvent unified above — Small Groups handled inside KIOSK.confirmEvent */

/* ════════════════════════════════════════════════════
   SMALL GROUPS MODULE
════════════════════════════════════════════════════ */
/* ── Generic API.call helper ── */
if(!API.call) API.call = (fn,...args) => gasRun(fn,...args);

/* ── Volunteer home card helpers ── */
function openVolDeptModal() { openModal('volDeptModal'); }
function openVolDept(dept, icon) {
  closeModal('volDeptModal');
  setTimeout(() => VOL.open(dept, icon), 200);
}

/* ── Small Groups home card helper ── */
function showSmallGroups() { SG.open(); }

/* Parent paging handled via data URI in QR — no hash router needed */

/* ════════════════════════════════════════════════════
   VOLUNTEER SCHEDULING MODULE
════════════════════════════════════════════════════ */
// Normalize a time value from the backend (could be "09:00" or a full Date string)
function fmtSchedTime_(v) {
  if (!v || v === 'undefined') return '';
  const s = String(v);
  // Already HH:MM
  if (/^\d{1,2}:\d{2}$/.test(s)) return s;
  // Full date string - extract local time
  if (s.length > 10) {
    try {
      const d = new Date(s);
      if (!isNaN(d)) return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
    } catch(e) {}
  }
  return s.slice(0,5);
}

const SCHED = {
  _events: [],
  _volunteers: [],
  _year: new Date().getFullYear(),
  _month: new Date().getMonth() + 1,
  _assignments: [],   // current event being built

  async open() {
    showSchedule();
  },

  async load() {
    // Show loading state immediately
    const grid = document.getElementById('schedCalGrid');
    const titleEl = document.getElementById('schedMonthTitle');
    const months = ['January','February','March','April','May','June',
      'July','August','September','October','November','December'];
    if(titleEl) titleEl.textContent = months[this._month-1] + ' ' + this._year;
    if(grid) {
      grid.innerHTML = '';
      // Show skeleton loading cells
      for(let i=0;i<35;i++){
        const sk = document.createElement('div');
        sk.style.cssText = 'min-height:64px;border-radius:10px;background:rgba(255,255,255,0.04);animation:pulse 1.5s ease infinite;animation-delay:'+(i*0.03)+'s';
        grid.appendChild(sk);
      }
    }
    try {
      const [evRes, volRes] = await Promise.all([
        gasRun('getScheduledEventsAPI', this._year, this._month),
        gasRun('getVolunteersAPI', 'all')
      ]);
      this._events = evRes?.events || [];
      this._volunteers = volRes?.volunteers || [];
    } catch(e) {
      console.error('SCHED.load error:', e);
      this._events = [];
      this._volunteers = [];
    }
    this.renderCalendar();
    this.updateHeader();
  },

  updateHeader() {
    const months = ['January','February','March','April','May','June',
      'July','August','September','October','November','December'];
    const el = document.getElementById('schedMonthTitle');
    if (el) el.textContent = months[this._month-1] + ' ' + this._year;
    const sub = document.getElementById('schedEventCount');
    if (sub) sub.textContent = this._events.length + ' event' + (this._events.length !== 1 ? 's' : '') + ' this month';
  },

  prevMonth() {
    this._month--;
    if (this._month < 1) { this._month = 12; this._year--; }
    this.load();
  },

  nextMonth() {
    this._month++;
    if (this._month > 12) { this._month = 1; this._year++; }
    this.load();
  },

  renderCalendar() {
    const grid = document.getElementById('schedCalGrid');
    if (!grid) return;

    const firstDay  = new Date(this._year, this._month - 1, 1).getDay();
    const daysInMonth = new Date(this._year, this._month, 0).getDate();
    const now = new Date();
    const todayStr = now.getFullYear() + '-'
      + String(now.getMonth() + 1).padStart(2, '0') + '-'
      + String(now.getDate()).padStart(2, '0');

    const evMap = {};
    this._events.forEach(e => {
      // Normalize date — could be "2026-05-03" or a Date object string
      const raw = e.date || '';
      // If it looks like a full Date string, parse it
      let k = String(raw).slice(0, 10);
      if (k.length < 10 || k.includes('GMT') || k.includes('T')) {
        try { const d = new Date(raw); k = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); } catch(ex) {}
      }
      if (!evMap[k]) evMap[k] = [];
      evMap[k].push(e);
    });

    const typeColors = {
      'Sunday Service': '#f59e0b', 'Youth Night': '#06b6d4',
      'Young Adult Ministry': '#8b5cf6', 'Small Groups': '#10b981',
      'Special Event': '#ec4899', 'Other': '#6b7280'
    };

    // Build grid using DOM — no innerHTML string escaping issues
    grid.innerHTML = '';

    // Empty offset cells
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.style.cssText = 'min-height:64px;border-radius:10px;background:rgba(255,255,255,0.015)';
      grid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const ds = this._year + '-'
        + String(this._month).padStart(2, '0') + '-'
        + String(d).padStart(2, '0');
      const isToday   = ds === todayStr;
      const dayEvs    = evMap[ds] || [];
      const hasEvents = dayEvs.length > 0;

      const cellBg = isToday
        ? 'rgba(139,92,246,0.15)'
        : hasEvents ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.015)';
      const cellBorder = isToday
        ? '1.5px solid rgba(139,92,246,0.6)'
        : hasEvents ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent';

      const cell = document.createElement('div');
      cell.style.cssText = 'min-height:64px;border-radius:10px;padding:6px;cursor:pointer;'
        + 'background:' + cellBg + ';border:' + cellBorder + ';transition:background .15s;-webkit-tap-highlight-color:transparent';

      // Day number
      const dayNum = document.createElement('div');
      dayNum.style.cssText = 'font-size:12px;font-weight:' + (isToday ? '900' : '600')
        + ';color:' + (isToday ? '#c4b5fd' : 'var(--text)') + ';margin-bottom:4px';
      dayNum.textContent = String(d);
      cell.appendChild(dayNum);

      // Event dots
      if (dayEvs.length) {
        const dotsRow = document.createElement('div');
        dotsRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:3px;margin-bottom:3px';
        dayEvs.slice(0, 3).forEach(e => {
          const dot = document.createElement('div');
          dot.style.cssText = 'width:7px;height:7px;border-radius:50%;background:'
            + (typeColors[e.type] || '#8b5cf6') + ';flex-shrink:0';
          dotsRow.appendChild(dot);
        });
        cell.appendChild(dotsRow);

        // First event label
        const lbl = document.createElement('div');
        lbl.style.cssText = 'font-size:8px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
        lbl.textContent = dayEvs[0].name.split('—')[0].trim();
        cell.appendChild(lbl);
      }

      // Hover + click
      cell.addEventListener('mouseover', function() { this.style.background = 'rgba(139,92,246,0.1)'; });
      cell.addEventListener('mouseout',  function() { this.style.background = cellBg; });
      cell.addEventListener('click', (function(date) { return function() { SCHED.showDay(date); }; })(ds));

      grid.appendChild(cell);
    }
  },

  showDay(dateStr) {
    const detail = document.getElementById('schedDayDetail');
    const title = document.getElementById('schedDayTitle');
    const sub = document.getElementById('schedDaySub');
    const evEl = document.getElementById('schedDayEvents');
    if (!detail) return;

    const d = new Date(dateStr + 'T12:00:00');
    const dayLabel = d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
    const dayEvents = this._events.filter(e => {
      const raw = String(e.date||'');
      let k = raw.slice(0,10);
      if(raw.includes('GMT')||raw.includes('T')){try{const d=new Date(raw);k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}catch(ex){}}
      return k === dateStr;
    });

    if (title) title.textContent = dayLabel;
    if (sub) sub.textContent = dayEvents.length + ' event' + (dayEvents.length !== 1 ? 's' : '') + ' scheduled';

    const typeColors = {
      'Sunday Service':['rgba(245,158,11,0.15)','#fcd34d'],
      'Youth Night':['rgba(6,182,212,0.15)','#67e8f9'],
      'Young Adult Ministry':['rgba(139,92,246,0.15)','#c4b5fd'],
      'Small Groups':['rgba(16,185,129,0.15)','#6ee7b7'],
      'Special Event':['rgba(236,72,153,0.15)','#f9a8d4'],
      'Other':['rgba(107,114,128,0.15)','#9ca3af']
    };

    const statusIcon = { accepted:'✓', declined:'✕', pending:'–' };
    const statusColor = { accepted:'#6ee7b7', declined:'#fca5a5', pending:'#fcd34d' };

    if (!dayEvents.length) {
      evEl.innerHTML = `<div style="padding:20px;text-align:center">
        <div style="font-size:32px;margin-bottom:10px"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
        <div style="font-size:13px;color:var(--muted)">No events scheduled</div>
        <button onclick="SCHED.openNewEventOnDate('${dateStr}')" style="margin-top:12px;padding:8px 18px;border-radius:100px;background:rgba(139,92,246,0.15);border:1px solid rgba(139,92,246,0.4);color:#c4b5fd;font-family:var(--body);font-size:12px;font-weight:700;cursor:pointer">+ Schedule Event</button>
      </div>`;
    } else {
      evEl.innerHTML = dayEvents.map(ev => {
        const [bg, col] = typeColors[ev.type] || typeColors['Other'];
        const accepted = ev.assignments.filter(a=>a.status==='accepted').length;
        const total = ev.assignments.length;
        return `<div style="background:${bg};border:1px solid ${col}30;border-radius:14px;padding:14px 16px;margin-bottom:10px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
            <div>
              <div style="font-family:var(--font);font-size:14px;font-weight:800;color:${col}">${ev.name}</div>
              <div style="font-size:11px;color:var(--muted);margin-top:2px">${[fmtSchedTime_(ev.startTime),fmtSchedTime_(ev.endTime)].filter(Boolean).join(' – ')}${ev.location ? ' · '+ev.location : ''}</div>
            </div>
            <div style="display:flex;gap:5px">
              <button onclick="SCHED.openEditEvent('${ev.id}')" style="width:28px;height:28px;border-radius:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:var(--muted);cursor:pointer;font-size:11px"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg></button>
              <button onclick="SCHED.deleteEvent('${ev.id}','${ev.name.replace(/'/,"\\'")}'); " style="width:28px;height:28px;border-radius:8px;background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2);color:#fca5a5;cursor:pointer;font-size:11px"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg></button>
            </div>
          </div>
          ${ev.notes ? `<div style="font-size:11px;color:var(--muted);font-style:italic;margin-bottom:10px;padding:8px 10px;background:rgba(0,0,0,0.2);border-radius:8px">${ev.notes}</div>` : ''}
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted2);margin-bottom:8px">Volunteers (${accepted}/${total} confirmed)</div>
          <div style="display:flex;flex-direction:column;gap:6px">
            ${ev.assignments.length === 0
              ? '<div style="font-size:12px;color:var(--muted);font-style:italic">No volunteers assigned</div>'
              : ev.assignments.map(a => `<div style="display:flex;align-items:center;gap:8px;background:rgba(0,0,0,0.2);border-radius:10px;padding:8px 10px">
                  <div style="width:28px;height:28px;border-radius:50%;background:${gradientForName(a.volName)};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#fff;flex-shrink:0">${initials(a.volName)}</div>
                  <div style="flex:1;min-width:0">
                    <div style="font-size:12px;font-weight:700;color:var(--text)">${a.volName}</div>
                    <div style="font-size:10px;color:var(--muted)">${a.role}${a.department ? ' · '+a.department : ''}</div>
                  </div>
                  <span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:100px;background:rgba(0,0,0,0.3);color:${statusColor[a.status]||'#9ca3af'}">${statusIcon[a.status]||'⏳'} ${(a.status||'pending').charAt(0).toUpperCase()+(a.status||'pending').slice(1)}</span>
                </div>`).join('')}
          </div>
          <button onclick="SCHED.addVolToEvent('${ev.id}')" style="width:100%;margin-top:8px;padding:7px;border-radius:10px;background:rgba(139,92,246,0.08);border:1px dashed rgba(139,92,246,0.3);color:#c4b5fd;font-family:var(--body);font-size:11px;font-weight:700;cursor:pointer">+ Add Volunteer</button>
        </div>`;
      }).join('');
    }

    detail.style.display = 'block';
    detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  /* ── MODALS ── */
  openNewEvent() {
    this._editId = null;
    this._assignments = [];
    document.getElementById('se_id').value = '';
    ['se_name','se_location','se_notes'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('se_type').value = 'Sunday Service';
    document.getElementById('se_start').value = '09:00';
    document.getElementById('se_end').value = '12:00';
    // Set date to today
    const today = new Date().toISOString().slice(0,10);
    document.getElementById('se_date').value = today;
    document.getElementById('schedEventModalTitle').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Schedule Event';
    this.renderVolAssignList();
    openModal('schedEventModal');
  },

  openNewEventOnDate(dateStr) {
    this.openNewEvent();
    document.getElementById('se_date').value = dateStr;
  },

  openEditEvent(eventId) {
    const ev = this._events.find(e => e.id === eventId);
    if (!ev) return;
    this._editId = eventId;
    this._assignments = ev.assignments.map(a => ({...a, _existing: true}));
    document.getElementById('se_id').value = eventId;
    document.getElementById('se_name').value = ev.name || '';
    document.getElementById('se_type').value = ev.type || 'Sunday Service';
    document.getElementById('se_date').value = String(ev.date).slice(0,10) || '';
    document.getElementById('se_start').value = ev.startTime || '09:00';
    document.getElementById('se_end').value = ev.endTime || '12:00';
    document.getElementById('se_location').value = ev.location || '';
    document.getElementById('se_notes').value = ev.notes || '';
    document.getElementById('schedEventModalTitle').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg> Edit Event';
    this.renderVolAssignList();
    openModal('schedEventModal');
  },

  renderVolAssignList() {
    const el = document.getElementById('seVolList');
    if (!el) return;
    if (!this._assignments.length) {
      el.innerHTML = '<div style="text-align:center;padding:16px;font-size:12px;color:var(--muted)">No volunteers assigned yet — tap <strong>+ Add Volunteer Assignment</strong> below</div>';
      return;
    }
    const statusIcon = { accepted:'✓', declined:'✕', pending:'–' };
    el.innerHTML = this._assignments.map((a, i) => `
      <div style="display:flex;align-items:center;gap:10px;background:var(--ink3);border:1px solid var(--rim);border-radius:12px;padding:10px 12px">
        <div style="width:32px;height:32px;border-radius:50%;background:${gradientForName(a.volName||'?')};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff;flex-shrink:0">${initials(a.volName||'?')}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:700;color:var(--text)">${a.volName||'—'}</div>
          <div style="font-size:11px;color:var(--muted)">${a.role||'Volunteer'}${a.department ? ' · '+a.department : ''}${a.volEmail ? ' · '+a.volEmail : ''}</div>
          ${a._existing ? `<div style="font-size:10px;color:var(--muted2)">${statusIcon[a.status]||'⏳'} ${a.status||'pending'}</div>` : '<div style="font-size:10px;color:#c4b5fd"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg> Invitation will be sent</div>'}
        </div>
        ${!a._existing ? `<button onclick="SCHED._removeAssign(${i})" style="width:26px;height:26px;border-radius:8px;background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2);color:#fca5a5;cursor:pointer;font-size:11px">✕</button>` : ''}
      </div>`).join('');
  },

  _removeAssign(idx) {
    this._assignments.splice(idx, 1);
    this.renderVolAssignList();
  },

  addVolAssignment() {
    // Show a quick volunteer picker
    const vols = this._volunteers;
    if (!vols.length) { toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> No volunteers registered yet','err'); return; }

    // Build a simple selection modal inline
    const picker = document.createElement('div');
    picker.style.cssText = 'position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,0.7);display:flex;align-items:flex-end;justify-content:center';
    picker.innerHTML = `<div style="background:var(--ink2);border-radius:20px 20px 0 0;padding:20px 16px 32px;width:100%;max-width:480px;max-height:70vh;overflow-y:auto">
      <div style="font-family:var(--font);font-size:14px;font-weight:800;color:#fff;margin-bottom:14px">Select Volunteer</div>
      ${vols.map(v => `<div onclick="SCHED._pickVol('${v.id}','${v.name.replace(/'/,"\\'")}','${(v.email||'').replace(/'/,"\\'")}','${(v.role||'Volunteer').replace(/'/,"\\'")}','${(v.department||'').replace(/'/,"\\'")}',this.parentElement.parentElement)" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;cursor:pointer;margin-bottom:6px;background:var(--ink3);border:1px solid var(--rim)">
        <div style="width:34px;height:34px;border-radius:50%;background:${gradientForName(v.name)};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff;flex-shrink:0">${initials(v.name)}</div>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:700;color:var(--text)">${v.name}</div>
          <div style="font-size:11px;color:var(--muted)">${v.role||''}${v.department ? ' · '+v.department : ''}${v.email ? ' · <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>' : ' · <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> no email'}</div>
        </div>
      </div>`).join('')}
      <button onclick="this.parentElement.parentElement.remove()" style="width:100%;margin-top:8px;padding:12px;border-radius:12px;background:var(--surface2);border:1px solid var(--rim);color:var(--muted);font-family:var(--body);font-size:13px;font-weight:700;cursor:pointer">Cancel</button>
    </div>`;
    document.body.appendChild(picker);
  },

  _pickVol(volId, volName, volEmail, role, dept, overlay) {
    this._assignments.push({ volId, volName, volEmail, role, department: dept, status: 'pending' });
    overlay.remove();
    this.renderVolAssignList();
  },

  addVolToEvent(eventId) {
    this._editId = eventId;
    const ev = this._events.find(e => e.id === eventId);
    this._assignments = ev ? [...ev.assignments.map(a=>({...a,_existing:true}))] : [];
    this.addVolAssignment();
    // On pick, save directly
    const origPick = this._pickVol.bind(this);
    this._pickVol = async (volId, volName, volEmail, role, dept, overlay) => {
      overlay.remove();
      showSaving('Adding volunteer…');
      try {
        const newAssign = [{ volId, volName, volEmail, role, department: dept }];
        const ev2 = this._events.find(e => e.id === eventId);
        const r = await gasRun('editScheduledEventAPI', eventId, {
          name: ev2?.name, type: ev2?.type, date: ev2?.date,
          startTime: ev2?.startTime, endTime: ev2?.endTime,
          location: ev2?.location, notes: ev2?.notes,
          newAssignments: newAssign
        });
        if (r?.success) { await this.load(); toast(volEmail ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> Volunteer added & invitation sent!' : '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> Volunteer added (no email on file)','ok'); }
        else toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> '+(r?.error||'Failed'),'err');
      } catch(e) { toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Error','err'); }
      hideSaving();
      this._pickVol = origPick;
    };
  },

  async saveEvent() {
    const id = document.getElementById('se_id').value;
    const name = document.getElementById('se_name').value.trim();
    const date = document.getElementById('se_date').value;
    if (!name || !date) { toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Event name and date are required','err'); return; }
    const data = {
      name, type: document.getElementById('se_type').value,
      date, startTime: document.getElementById('se_start').value,
      endTime: document.getElementById('se_end').value,
      location: document.getElementById('se_location').value.trim(),
      notes: document.getElementById('se_notes').value.trim(),
      assignments: this._assignments.filter(a => !a._existing),
      newAssignments: this._assignments.filter(a => !a._existing),
      createdBy: SESSION.name || 'Admin'
    };
    showSaving(id ? 'Updating event…' : 'Creating event & sending invitations…');
    try {
      const r = id
        ? await gasRun('editScheduledEventAPI', id, data)
        : await gasRun('addScheduledEventAPI', data);
      if (r?.success) {
        closeModal('schedEventModal');
        await this.load();
        const sent = r.emailsSent?.length || 0;
        toast(id ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> Event updated' : `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> Event created! ${sent} invitation${sent!==1?'s':''} sent`,'ok');
      } else toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> '+(r?.error||'Failed'),'err');
    } catch(e) { toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Error','err'); }
    hideSaving();
  },

  async deleteEvent(id, name) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    showSaving('Deleting…');
    try {
      const r = await gasRun('deleteScheduledEventAPI', id);
      if (r?.success) { document.getElementById('schedDayDetail').style.display = 'none'; await this.load(); toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg> Event deleted','ok'); }
    } catch(e) { toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Error','err'); }
    hideSaving();
  },

  /* ── PRINT CALENDAR ── */
  printCalendar() {
    const months = ['January','February','March','April','May','June',
      'July','August','September','October','November','December'];
    const monthName = months[this._month-1] + ' ' + this._year;
    const firstDay = new Date(this._year, this._month-1, 1).getDay();
    const daysInMonth = new Date(this._year, this._month, 0).getDate();

    const typeColors = {
      'Sunday Service':'#d97706','Youth Night':'#0891b2',
      'Young Adult Ministry':'#7c3aed','Small Groups':'#059669',
      'Special Event':'#be185d','Other':'#6b7280'
    };

    const evMap = {};
    this._events.forEach(e => {
      const d = String(e.date).slice(0,10);
      if (!evMap[d]) evMap[d] = [];
      evMap[d].push(e);
    });

    const statusBg = { accepted:'#d1fae5', declined:'#fee2e2', pending:'#fef3c7' };
    const statusColor = { accepted:'#065f46', declined:'#991b1b', pending:'#92400e' };

    let calHTML = '';
    for (let i = 0; i < firstDay; i++) calHTML += '<div class="cal-cell empty"></div>';
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = this._year+'-'+String(this._month).padStart(2,'0')+'-'+String(d).padStart(2,'0');
      const dayEvs = evMap[ds] || [];
      calHTML += `<div class="cal-cell${dayEvs.length?' has-events':''}">
        <div class="day-num">${d}</div>
        ${dayEvs.map(e => `<div class="ev-pill" style="background:${typeColors[e.type]||'#6b7280'}">
          <div class="ev-pill-name">${e.name}</div>
          ${e.startTime ? `<div class="ev-pill-time">${e.startTime}</div>` : ''}
        </div>`).join('')}
      </div>`;
    }

    // Build schedule list for events this month
    const sortedEvents = [...this._events].sort((a,b) => String(a.date).localeCompare(String(b.date)));
    const schedHTML = sortedEvents.map(ev => {
      const dateLabel = new Date(String(ev.date)+'T12:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
      const color = typeColors[ev.type] || '#6b7280';
      const cols = {
        accepted: ev.assignments.filter(a=>a.status==='accepted').length,
        declined: ev.assignments.filter(a=>a.status==='declined').length,
        pending: ev.assignments.filter(a=>!a.status||a.status==='pending').length,
      };
      return `<div class="sched-event" style="border-left-color:${color}">
        <div class="sched-event-header">
          <div>
            <div class="sched-event-name">${ev.name}</div>
            <div class="sched-event-meta">${dateLabel} · ${[fmtSchedTime_(ev.startTime),fmtSchedTime_(ev.endTime)].filter(Boolean).join(' – ')}${ev.location ? ' · '+ev.location : ''}</div>
          </div>
          <div class="sched-event-badge" style="background:${color}20;color:${color}">${ev.type}</div>
        </div>
        ${ev.notes ? `<div class="sched-event-notes">${ev.notes}</div>` : ''}
        ${ev.assignments.length ? `
          <div class="sched-stats">
            <span class="stat-chip accepted"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg> ${cols.accepted} Confirmed</span>
            <span class="stat-chip pending">⏳ ${cols.pending} Pending</span>
            ${cols.declined ? `<span class="stat-chip declined"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17" stroke-width="2.5"/></svg> ${cols.declined} Declined</span>` : ''}
          </div>
          <table class="vol-table">
            <thead><tr><th>Volunteer</th><th>Role</th><th>Department</th><th>Status</th></tr></thead>
            <tbody>${ev.assignments.map(a=>`<tr>
              <td>${a.volName}</td>
              <td>${a.role||'—'}</td>
              <td>${a.department||'—'}</td>
              <td><span class="status-badge" style="background:${statusBg[a.status]||'#fef3c7'};color:${statusColor[a.status]||'#92400e'}">${a.status||'pending'}</span></td>
            </tr>`).join('')}</tbody>
          </table>` : '<div class="no-vol">No volunteers assigned</div>'}
      </div>`;
    }).join('');

    const css = `
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:Arial,Helvetica,sans-serif;background:#fff;color:#111;padding:32px}
      h1{font-size:28px;font-weight:900;color:#1e1b4b;margin-bottom:4px}
      .subtitle{font-size:13px;color:#6b7280;margin-bottom:28px}
      /* Calendar */
      .cal-header{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:4px}
      .cal-header div{text-align:center;font-size:10px;font-weight:800;color:#6b7280;letter-spacing:1px;padding:6px 0}
      .cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:36px}
      .cal-cell{min-height:72px;border:1px solid #e5e7eb;border-radius:8px;padding:6px;background:#fff}
      .cal-cell.empty{background:#f9fafb;border-color:#f3f4f6}
      .cal-cell.has-events{border-color:#c4b5fd}
      .day-num{font-size:13px;font-weight:700;color:#374151;margin-bottom:4px}
      .ev-pill{border-radius:4px;padding:2px 5px;margin-bottom:2px}
      .ev-pill-name{font-size:8px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .ev-pill-time{font-size:7px;color:rgba(255,255,255,0.8)}
      /* Schedule list */
      h2{font-size:18px;font-weight:800;color:#1e1b4b;margin-bottom:16px;padding-top:4px;border-top:3px solid #8b5cf6}
      .sched-event{border-left:4px solid #8b5cf6;border-radius:0 12px 12px 0;padding:14px 16px;margin-bottom:16px;background:#fafafa;border:1px solid #e5e7eb;border-left-width:4px}
      .sched-event-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px}
      .sched-event-name{font-size:15px;font-weight:800;color:#1e1b4b;margin-bottom:3px}
      .sched-event-meta{font-size:11px;color:#6b7280}
      .sched-event-badge{font-size:10px;font-weight:700;padding:3px 10px;border-radius:100px;flex-shrink:0}
      .sched-event-notes{font-size:11px;color:#6b7280;font-style:italic;margin-bottom:10px;padding:8px;background:#f3f4f6;border-radius:6px}
      .sched-stats{display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap}
      .stat-chip{font-size:10px;font-weight:700;padding:3px 10px;border-radius:100px}
      .stat-chip.accepted{background:#d1fae5;color:#065f46}
      .stat-chip.pending{background:#fef3c7;color:#92400e}
      .stat-chip.declined{background:#fee2e2;color:#991b1b}
      .vol-table{width:100%;border-collapse:collapse;font-size:11px}
      .vol-table th{text-align:left;padding:6px 8px;background:#f3f4f6;font-weight:700;color:#374151;border-bottom:2px solid #e5e7eb}
      .vol-table td{padding:6px 8px;border-bottom:1px solid #f3f4f6;color:#374151}
      .vol-table tr:last-child td{border-bottom:none}
      .status-badge{font-size:9px;font-weight:700;padding:2px 7px;border-radius:100px;text-transform:capitalize}
      .no-vol{font-size:11px;color:#9ca3af;font-style:italic;margin-top:4px}
      .print-footer{margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:10px;color:#9ca3af;text-align:center}
      @media print{body{padding:16px}.sched-event{break-inside:avoid}}`;

    const win = window.open('','_blank','width=1000,height=800');
    if (!win) { toast('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg> Allow pop-ups to print','err'); return; }
    win.document.open();
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Volunteer Schedule — ${monthName}</title><style>${css}</style></head>
<body>
  <h1><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Volunteer Schedule</h1>
  <p class="subtitle">${monthName} · Generated ${new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
  <div class="cal-header"><div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div></div>
  <div class="cal-grid">${calHTML}</div>
  <h2>Event Details & Volunteer Assignments</h2>
  ${schedHTML || '<p style="color:#9ca3af;font-style:italic">No events scheduled this month.</p>'}
  <div class="print-footer">Bolt Kiosk · Ministry Check-In System · Volunteer Schedule · ${monthName}</div>
  <script>window.addEventListener('load',function(){window.print()});<\/script>
</body></html>`);
    win.document.close();
  },

  /* ── RSVP HANDLER (called from URL params) ── */
  async handleRsvp(assignId, response) {
    const el = document.getElementById('rsvpContent');
    const overlay = document.getElementById('vRsvp');
    if (overlay) overlay.style.display = 'flex';
    if (!el) return;
    el.innerHTML = '<div style="text-align:center;padding:30px 0"><div style="font-size:32px;margin-bottom:12px">⏳</div><div style="color:#94a3b8">Recording your response…</div></div>';
    try {
      const r = await gasRun('rsvpResponseAPI', assignId, response);
      if (r?.success) {
        const isAccepted = response === 'accepted';
        el.innerHTML = `<div style="text-align:center">
          <div style="font-size:56px;margin-bottom:16px">${isAccepted ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><circle cx="12" cy="12" r="10"/><path d="M7 12l3 3 7-7"/></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17" stroke-width="2.5"/></svg>'}</div>
          <div style="font-size:20px;font-weight:800;color:#fff;margin-bottom:8px">
            ${isAccepted ? 'You\'re confirmed!' : 'Response recorded'}
          </div>
          <div style="font-size:14px;color:#94a3b8;margin-bottom:24px;line-height:1.6">
            ${isAccepted
              ? `Great! We'll see you at <strong style="color:#c4b5fd">${r.eventName}</strong>. Thank you for serving!`
              : `We've noted that you can't make it to <strong style="color:#c4b5fd">${r.eventName}</strong>. Thank you for letting us know.`}
          </div>
          <div style="background:${isAccepted ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'};border:1px solid ${isAccepted ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'};border-radius:12px;padding:14px 16px;margin-bottom:20px">
            <div style="font-size:13px;font-weight:700;color:${isAccepted ? '#6ee7b7' : '#fca5a5'}">
              ${r.volName} · ${response.charAt(0).toUpperCase()+response.slice(1)}
            </div>
            <div style="font-size:11px;color:#64748b;margin-top:4px">${r.eventName}</div>
          </div>
          <button onclick="window.location.href=window.location.pathname" style="padding:12px 24px;border-radius:12px;background:rgba(139,92,246,0.2);border:1px solid rgba(139,92,246,0.4);color:#c4b5fd;font-family:sans-serif;font-size:14px;font-weight:700;cursor:pointer">Open Bolt Kiosk</button>
        </div>`;
      } else {
        el.innerHTML = '<div style="text-align:center;padding:20px"><div style="font-size:40px;margin-bottom:12px"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg></div><div style="color:#fca5a5">Could not record response. The link may have expired.</div></div>';
      }
    } catch(e) {
      el.innerHTML = '<div style="text-align:center;padding:20px"><div style="font-size:40px;margin-bottom:12px"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex-shrink:0;display:inline-block"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.5"/></svg></div><div style="color:#fca5a5">Connection error. Please try again.</div></div>';
    }
  }
};

/* ── Home card → Schedule ── */
function showSchedule() {
  showView('vSchedule');
  // Update header immediately with current month before API loads
  const months = ['January','February','March','April','May','June',
    'July','August','September','October','November','December'];
  const titleEl = document.getElementById('schedMonthTitle');
  const subEl   = document.getElementById('schedEventCount');
  if(titleEl) titleEl.textContent = months[SCHED._month-1] + ' ' + SCHED._year;
  if(subEl)   subEl.textContent   = 'Loading events…';
  // Load data async
  SCHED.load().catch(e => console.error('Schedule load error:', e));
}

/* RSVP link handling moved to main load handler for security */

/* ── Add to API ── */

/* ── SESSION SYNC TO FRAMES ── */
function _syncSessionToFrames() {
  try {
    const msg = { type:'SESSION_SYNC', session:{token:SESSION.token||'',orgId:SESSION.orgId||'',name:SESSION.name||'',role:SESSION.role||''} };
    document.querySelectorAll('iframe').forEach(f=>{try{f.contentWindow.postMessage(msg,'*');}catch(e){}});
    if(window.frames){for(let i=0;i<window.frames.length;i++){try{window.frames[i].SESSION=msg.session;}catch(e){}}}
  } catch(e){}
}

/* ── MOBILE DASHBOARD SIMPLIFICATION ── */
function applyMobileDashboard() {
  const isMob = window.innerWidth <= 600;
  if (!isMob) return;
  const strip = document.querySelector('.stat-strip,[class*="stat-strip"]');
  if (strip) { strip.style.gridTemplateColumns='1fr 1fr'; strip.style.gap='8px'; }
}
window.addEventListener('resize', applyMobileDashboard);
window.addEventListener('load', function(){ setTimeout(applyMobileDashboard,400); });

/* ═══════════════════════════════════════════════════════════════
   BOLT KIOSK — INTERACTIVE TOUR v2
   Fixes: mobile cutoff, pre-login firing, card positioning
═══════════════════════════════════════════════════════════════ */

const TOUR = {
  _step: 0,
  _active: false,

  steps: [
    { title:'Welcome to Bolt Kiosk!', body:"Your all-in-one ministry check-in system. This 60-second tour walks you through everything.", target:null, icon:'bolt', wide:true },
    { title:'Ministry Events', body:"Tap this card to open a live check-in session — Sunday Service, Youth Night, Young Adults, Small Groups, or a Special Event.", target:'[onclick*="showKiosk"]', icon:'bolt' },
    { title:'Dashboard & Analytics', body:"See live check-ins, attendance trends, at-risk members, and weekly reports — updated every 30 seconds in real time.", target:'[onclick*="showDash"]', icon:'analytics' },
    { title:"Children's Ministry", body:"Register families, check in children, and track attendance. The right panel shows every family's check-in status.", target:'[onclick*="showCM"]', icon:'child' },
    { title:'Volunteer Departments', body:"Manage Worship Team, Ushers, Security, Media, and more. Check in your whole team and see who's on duty.", target:'[onclick*="openVolDeptModal"]', icon:'shield' },
    { title:'Volunteer Schedule', body:"Plan upcoming events, assign volunteers, send email invites, and track RSVP responses from one calendar view.", target:'[onclick*="showSchedule"]', icon:'schedule' },
    { title:'Check-In Flow', body:"Search by name, tap to check in — done in under 3 seconds. Youth Night also supports batch check-in for entire groups.", target:null, icon:'checkin', illustration:'checkin' },
    { title:'Private & Secure', body:"Each church gets its own isolated database. Your data is never shared with other organizations.", target:null, icon:'shield', illustration:'org' },
    { title:"You're all set!", body:"Start by choosing a ministry event from the home screen. Tap the info button anytime to replay this tour.", target:null, icon:'check', wide:true },
  ],

  init() {
    if (!window.SESSION || !SESSION.token) return;
    const home = document.getElementById('vHome');
    if (!home || !home.classList.contains('active')) return;
    if (localStorage.getItem('bk_tour_done')) return;
    setTimeout(() => this.start(), 700);
  },

  start() { this._step=0; this._active=true; this._css(); this._render(); },
  finish() { this._active=false; localStorage.setItem('bk_tour_done','1'); this._destroy(); },
  goto(n) { this._step=Math.max(0,Math.min(n,this.steps.length-1)); this._render(); },
  next() { this._step<this.steps.length-1 ? this.goto(this._step+1) : this.finish(); },
  prev() { this._step>0 ? this.goto(this._step-1) : null; },

  _destroy() {
    ['bkTourOverlay','bkTourSpotlight'].forEach(id=>{
      const el=document.getElementById(id); if(!el) return;
      el.style.opacity='0'; el.style.transition='opacity .22s ease';
      setTimeout(()=>el.remove(),240);
    });
  },

  _css() {
    if(document.getElementById('bkTourCSS')) return;
    const s=document.createElement('style'); s.id='bkTourCSS';
    s.textContent=[
      '@keyframes bkCardIn{from{opacity:0;transform:translate(-50%,-50%) scale(0.94)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}',
      '@keyframes bkFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
      '@keyframes bkPulse{0%,100%{box-shadow:0 0 0 9999px rgba(0,0,0,.8),0 0 0 3px rgba(3,213,225,.85),0 0 30px rgba(3,213,225,.3)}50%{box-shadow:0 0 0 9999px rgba(0,0,0,.8),0 0 0 3px rgba(3,213,225,.4),0 0 50px rgba(3,213,225,.55)}}',
      '#bkTourCard{animation:bkCardIn .32s cubic-bezier(.22,.68,0,1.2) forwards}',
      '.bkNext:hover{filter:brightness(1.12);transform:scale(1.02)}.bkNext:active,.bkBack:active{transform:scale(.97)}',
      '.bkBack:hover{background:rgba(255,255,255,.1)!important}',
      '.bkDot{cursor:pointer;transition:all .25s ease}',
      '.bkRow{animation:bkFadeIn .35s ease both}',
    ].join('');
    document.head.appendChild(s);
  },

  _svg(name) {
    const d={bolt:'M13 2L4.5 13.5H12L11 22l8.5-11.5H13Z',analytics:'M22 12h-4l-3 9L9 3l-3 9H2',child:'M12 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm-3 8v11m6-11v11',shield:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',schedule:'M3 4h18v16H3zM16 2v4M8 2v4M3 10h18',checkin:'M20 6L9 17l-5-5',check:'M20 6L9 17l-5-5'};
    return '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="'+(d[name]||d.bolt)+'"/></svg>';
  },

  _illus(type) {
    if(type==='checkin'){
      return ['Marcus Johnson','Rachel Pena','David Kim'].map((n,i)=>{
        const ok=i===0;
        return '<div class="bkRow" style="display:flex;align-items:center;gap:10px;background:rgba(3,213,225,.06);border:1px solid rgba(3,213,225,'+(ok?.3:.1)+');border-radius:11px;padding:10px 13px;margin-bottom:7px;animation-delay:'+(i*.1)+'s">'+
          '<div style="width:30px;height:30px;border-radius:50%;background:rgba(3,213,225,.15);color:#03d5e1;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center">'+n.split(' ').map(w=>w[0]).join('')+'</div>'+
          '<div style="flex:1;font-size:13px;font-weight:700;color:#d4f0f4">'+n+'</div>'+
          '<div style="background:'+(ok?'#0fa86a':'rgba(3,213,225,.15)')+';color:'+(ok?'#fff':'#03d5e1')+';font-size:10px;font-weight:800;padding:4px 11px;border-radius:100px">'+(ok?'Checked In':'Check In')+'</div>'+
          '</div>';
      }).join('');
    }
    if(type==='org'){
      return '<div style="display:flex;gap:8px;margin-bottom:4px">'+
        ['Grace Community','Rock Church','Hope Fellowship'].map((n,i)=>
          '<div class="bkRow" style="flex:1;background:rgba(3,213,225,.07);border:1px solid rgba(3,213,225,.18);border-radius:11px;padding:11px 8px;text-align:center;animation-delay:'+(i*.11)+'s">'+
          '<div style="font-size:20px;margin-bottom:5px">⛪</div>'+
          '<div style="font-size:11px;font-weight:700;color:#d4f0f4">'+n+'</div>'+
          '<div style="font-size:9px;color:rgba(3,213,225,.5);margin-top:3px;font-weight:600">PRIVATE DB</div></div>'
        ).join('')+'</div>';
    }
    return '';
  },

  _target(sel) {
    if(!sel) return null;
    for(const s of sel.split(',')){
      try{const el=document.querySelector(s.trim());if(el){const r=el.getBoundingClientRect();if(r.width>0&&r.height>0)return{el,rect:r};}}catch(e){}
    }
    return null;
  },

  _render() {
    this._destroy();
    const step=this.steps[this._step], total=this.steps.length;
    const isFirst=this._step===0, isLast=this._step===total-1;
    const isMob=window.innerWidth<=640;
    const tgt=isMob?null:this._target(step.target);
    const cardW=Math.min(step.wide?420:380,window.innerWidth-32);
    const pct=Math.round(this._step/(total-1)*100);

    if(tgt){
      const pad=11,{rect}=tgt,sp=document.createElement('div');
      sp.id='bkTourSpotlight';
      sp.style.cssText='position:fixed;top:'+(rect.top-pad)+'px;left:'+(rect.left-pad)+'px;width:'+(rect.width+pad*2)+'px;height:'+(rect.height+pad*2)+'px;border-radius:16px;z-index:9997;pointer-events:none;animation:bkPulse 2s ease infinite;';
      document.body.appendChild(sp);
      tgt.el.scrollIntoView({behavior:'smooth',block:'center'});
    }

    const ov=document.createElement('div'); ov.id='bkTourOverlay';
    ov.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,'+(tgt?0:.82)+');backdrop-filter:blur('+(tgt?0:10)+'px);-webkit-backdrop-filter:blur('+(tgt?0:10)+'px);display:'+(tgt?'block':'flex')+';align-items:center;justify-content:center;padding:'+(tgt?'0':'16px')+';box-sizing:border-box;';

    let cardStyle='';
    if(tgt){
      const{rect}=tgt,vp=window.innerHeight,vw=window.innerWidth;
      const spB=vp-rect.bottom, spA=rect.top;
      // Vertical: prefer below, fallback above
      let top=spB>=240||spB>=spA ? rect.bottom+14 : Math.max(16,rect.top-260);
      // Horizontal: center on target, clamp to viewport with 16px margin each side
      let left=rect.left+rect.width/2-cardW/2;
      left=Math.max(16,Math.min(left,vw-cardW-16));
      // If card would go below viewport, clamp it up
      if(top+280>vp) top=Math.max(16,vp-300);
      cardStyle='position:fixed;top:'+top+'px;left:'+left+'px;';
    }

    const dots=this.steps.map((_,i)=>'<div class="bkDot" onclick="TOUR.goto('+i+')" style="width:'+(i===this._step?16:6)+'px;height:6px;border-radius:3px;background:'+(i===this._step?'#03d5e1':i<this._step?'rgba(3,213,225,.4)':'rgba(255,255,255,.1)')+'"></div>').join('');
    const ill=step.illustration?'<div style="margin-bottom:14px">'+this._illus(step.illustration)+'</div>':'';

    ov.innerHTML='<div id="bkTourCard" style="'+cardStyle+'width:'+cardW+'px;max-height:min(84vh,660px);overflow-y:auto;-webkit-overflow-scrolling:touch;background:linear-gradient(155deg,#0d1f27,#091519);border:1px solid rgba(3,213,225,.2);border-radius:20px;padding:22px;box-shadow:0 28px 80px rgba(0,0,0,.72),inset 0 1px 0 rgba(255,255,255,.06);font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#d4f0f4;scrollbar-width:thin;">'+
      '<div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#03d5e1 '+pct+'%,rgba(255,255,255,.07) '+pct+'%);border-radius:20px 20px 0 0;transition:background .4s"></div>'+
      '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px">'+
        '<div style="display:flex;align-items:center;gap:11px">'+
          '<div style="width:42px;height:42px;border-radius:12px;background:rgba(3,213,225,.1);border:1px solid rgba(3,213,225,.2);display:flex;align-items:center;justify-content:center;color:#03d5e1;flex-shrink:0">'+this._svg(step.icon)+'</div>'+
          '<div><div style="font-size:9px;font-weight:800;color:#03d5e1;text-transform:uppercase;letter-spacing:2px;margin-bottom:3px">'+(this._step+1)+' of '+total+'</div><div style="font-size:16px;font-weight:800;color:#fff;line-height:1.2">'+step.title+'</div></div>'+
        '</div>'+
        '<button onclick="TOUR.finish()" style="background:none;border:none;color:rgba(255,255,255,.25);font-size:22px;cursor:pointer;padding:0 4px;line-height:1;border-radius:6px;flex-shrink:0">&times;</button>'+
      '</div>'+
      ill+
      '<p style="font-size:14px;line-height:1.65;color:rgba(212,240,244,.82);margin:0 0 16px">'+step.body+'</p>'+
      '<div style="display:flex;gap:5px;align-items:center;margin-bottom:14px;flex-wrap:wrap">'+dots+'</div>'+
      '<div style="display:flex;gap:9px;align-items:center">'+
        (!isFirst?'<button class="bkBack" onclick="TOUR.prev()" style="flex-shrink:0;padding:10px 15px;border-radius:11px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:rgba(255,255,255,.55);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .18s">\u2190 Back</button>':'')+
        '<button class="bkNext" onclick="TOUR.next()" style="flex:1;padding:12px 18px;border-radius:11px;border:none;background:linear-gradient(135deg,#03d5e1,#028a94);color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .18s">'+
          (isLast?'Get Started':isFirst?'Start Tour \u2192':'Next \u2192')+
        '</button>'+
      '</div>'+
      (isFirst?'<p style="text-align:center;font-size:11px;color:rgba(255,255,255,.18);margin:11px 0 0">Tap \xd7 to skip \xb7 Replay anytime with the info button</p>':'')+
      '</div>';

    if(!tgt||isMob) ov.addEventListener('click',e=>{if(e.target===ov)this.next();});
    document.body.appendChild(ov);
  },
};

function replayTour(){localStorage.removeItem('bk_tour_done');TOUR.start();}

/* ── Quick Tour button ── */
(function(){
  function mkBtn(){
    if(document.getElementById('bkTourBtn')) return;
    const btn=document.createElement('button');
    btn.id='bkTourBtn';
    btn.title='Quick Tour';
    btn.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2.8"/></svg><span style="margin-left:5px">Quick Tour</span>';
    btn.onclick=()=>replayTour();
    btn.style.cssText='display:none;align-items:center;position:fixed;bottom:80px;right:16px;background:rgba(3,213,225,.08);border:1px solid rgba(3,213,225,.24);color:#03d5e1;font-size:11px;font-weight:700;padding:8px 13px;border-radius:100px;cursor:pointer;font-family:inherit;z-index:400;backdrop-filter:blur(8px);box-shadow:0 4px 18px rgba(3,213,225,.1);transition:all .2s;letter-spacing:.3px';
    btn.onmouseenter=()=>{btn.style.background='rgba(3,213,225,.16)';btn.style.transform='scale(1.04)';};
    btn.onmouseleave=()=>{btn.style.background='rgba(3,213,225,.08)';btn.style.transform='';};
    document.body.appendChild(btn);
  }
  function setVis(v){const b=document.getElementById('bkTourBtn');if(b)b.style.display=v?'flex':'none';}
  window.addEventListener('load',function(){
    mkBtn();
    const orig=window.showView;
    if(orig){
      window.showView=function(id){
        orig.apply(this,arguments);
        setVis(id==='vHome');
        // Start tour on home — only if logged in
        if(id==='vHome') setTimeout(()=>{if(window.SESSION&&SESSION.token)TOUR.init();},500);
      };
    }
  });
})();
