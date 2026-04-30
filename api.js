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
  getWeeklyReport:(offset)    => gasRun('getWeeklyReportForPWA', offset),

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

// Children's Ministry — Family Registry
API.getFamilies       = ()          => gasRun('getFamiliesAPI');
API.searchFamilies    = (q)         => gasRun('searchFamiliesAPI', q);
API.addFamily         = (data)      => gasRun('addFamilyAPI', data);
API.addChild          = (data)      => gasRun('addChildAPI', data);
API.editFamily        = (id, data)  => gasRun('editFamilyAPI', id, data);
API.editChild         = (id, data)  => gasRun('editChildAPI', id, data);
API.deleteFamily      = (id)        => gasRun('deleteFamilyAPI', id);
API.deleteChild       = (id)        => gasRun('deleteChildAPI', id);
API.checkInFamily     = (id, meta)  => gasRun('checkInFamilyAPI', id, meta);

// Volunteer Management
API.getVolunteers        = (dept)       => gasRun('getVolunteersAPI', dept||'all');
API.addVolunteer         = (data)       => gasRun('addVolunteerAPI', data);
API.editVolunteer        = (id, data)   => gasRun('editVolunteerAPI', id, data);
API.deleteVolunteer      = (id)         => gasRun('deleteVolunteerAPI', id);
API.checkInVolunteer     = (id, meta)   => gasRun('checkInVolunteerAPI', id, meta);
API.getVolunteerCheckIns = (dept)       => gasRun('getVolunteerCheckInsAPI', dept||'all');
API.getDepartments       = ()           => gasRun('getDepartmentsAPI');
API.addDepartment        = (n, i, c)    => gasRun('addDepartmentAPI', n, i, c);
API.deleteDepartment     = (id)         => gasRun('deleteDepartmentAPI', id);
API.getVolunteerDashboard= ()           => gasRun('getVolunteerDashboardAPI');

// Small Groups
API.getSmallGroups   = ()           => gasRun('getSmallGroupsAPI');
API.addSmallGroup    = (data)       => gasRun('addSmallGroupAPI', data);
API.editSmallGroup   = (id, data)   => gasRun('editSmallGroupAPI', id, data);
API.deleteSmallGroup = (id)         => gasRun('deleteSmallGroupAPI', id);
API.addSGMember      = (data)       => gasRun('addSGMemberAPI', data);
API.editSGMember     = (id, data)   => gasRun('editSGMemberAPI', id, data);
API.deleteSGMember   = (id)         => gasRun('deleteSGMemberAPI', id);
API.checkInSGGroup   = (id, meta)   => gasRun('checkInSGGroupAPI', id, meta);
