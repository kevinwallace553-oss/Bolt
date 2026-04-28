/* ═══════════════════════════════════════════════════
   BOLT KIOSK — API Layer
   All calls to Google Apps Script backend
═══════════════════════════════════════════════════ */
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxZF9WHP1F99CcE5LgzzLLksd7CnSB4HoYXT7-klO6bSsDspIT8QPRfH5mttsB_ZfE1/exec';

async function gasRun(fn, ...args) {
  const body = JSON.stringify({ fn, args });
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' }, // avoid CORS preflight
    body
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch(e) { return { success: false, error: text }; }
}

// Auth
const API = {
  login:          (u,p)       => gasRun('authLoginAPI', u, p),
  register:       (n,e,u,p)   => gasRun('authRegisterAPI', n, e, u, p),
  logout:         (t)         => gasRun('authLogoutAPI', t),
  validate:       (t)         => gasRun('authValidateTokenAPI', t),
  forgotPassword: (e)         => gasRun('authForgotPasswordAPI', e),
  resetPassword:  (e,c,p)     => gasRun('authResetPasswordAPI', e, c, p),

  // Students
  searchStudents: (q)         => gasRun('searchStudentsAPI', q),
  getAllStudents:  ()          => gasRun('getAllStudentsAPI'),
  addStudent:     (data, ci)  => gasRun('addNewStudentAPI', data, ci),
  editStudent:    (id, data)  => gasRun('editStudentAPI', id, data),
  deleteStudent:  (id)        => gasRun('deleteStudentAPI', id),
  uploadPhoto:    (b64, name) => gasRun('uploadPhotoAPI', b64, name),

  // Check-ins
  checkIn:        (st, meta)  => gasRun('checkInAPI', st, meta),
  batchCheckIn:   (list, meta)=> gasRun('batchCheckInAPI', list, meta),
  getTodayCheckins:()         => gasRun('getCheckInsTodayAPI'),
  getDashboard:   ()          => gasRun('getDashboardData'),
  getWeeklyReport:(offset)    => gasRun('getWeeklyCheckInsAPI', offset),

  // Leaders
  getLeaders:     ()          => gasRun('getLeaders'),
  addLeader:      (name)      => gasRun('addLeaderAPI', name),

  // Analytics
  getAnalytics:   ()          => gasRun('getAnalyticsData'),
  getAtRisk:      ()          => gasRun('getAtRiskStudents'),
  getHistory:     (id, name)  => gasRun('getStudentAttendanceHistory', id, name),
};

/* ── OFFLINE BODY CLASS ── */
window.addEventListener('online',  () => document.body.classList.remove('offline'));
window.addEventListener('offline', () => document.body.classList.add('offline'));
