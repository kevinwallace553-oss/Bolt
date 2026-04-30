/********** CONFIG **********/
const SPREADSHEET_ID      = '1HSnsJlpMh9-1WE7rXdD9mvqlvWoKaWeSXj0Izrgrwrw';
const STUDENTS_SHEET_NAME = 'Students';
const CHECKINS_SHEET_NAME = 'CheckIns';
const PHOTO_FOLDER_ID     = '1e5eK8BRHHP2VSuYfdfSfDB3NEqPkWBVI';
const USERS_SHEET_NAME    = 'Users';
const SESSION_SHEET_NAME  = 'Sessions';
const TOKEN_TTL_HOURS     = 168;   // 7 days
const RESET_CODE_TTL_MIN  = 30;
const CACHE_TTL_CHECKINS  = 4;
const CACHE_TTL_STUDENTS  = 300;
const CACHE_TTL_ATRISK    = 120;
const CACHE_TTL_ANALYTICS = 600;
const CACHE_TTL_BIRTHDAYS = 300;

/********** CACHE **********/
function cacheGet_(k){try{const r=CacheService.getScriptCache().get(k);return r?JSON.parse(r):null;}catch(e){return null;}}
function cachePut_(k,v,t){try{const s=JSON.stringify(v);if(s.length<90000)CacheService.getScriptCache().put(k,s,t);}catch(e){}}
function cacheRemove_(k){try{CacheService.getScriptCache().remove(k);}catch(e){}}
function cacheBust_(){try{CacheService.getScriptCache().removeAll(['checkins_today','students_all','birthdays','atrisk','analytics_weekly','analytics_monthly']);}catch(e){}}

/********** SS **********/
let _ss=null;
function ss_(){if(!_ss)_ss=SpreadsheetApp.openById(SPREADSHEET_ID);return _ss;}

/********** HEADER MAP **********/
function getHeaderMap_(sheetName){
  const sheet=ss_().getSheetByName(sheetName);
  if(!sheet)throw new Error('Sheet not found: '+sheetName);
  const lastCol=sheet.getLastColumn();
  if(lastCol<1)return{sheet,map:{}};
  const headers=sheet.getRange(1,1,1,lastCol).getValues()[0];
  const map={};
  headers.forEach((name,idx)=>{if(name)map[String(name).trim().toLowerCase()]=idx;});
  return{sheet,map};
}
function normalize_(str){return String(str||'').toLowerCase().trim().replace(/\s+/g,' ');}

/********** AUTH HELPERS **********/
function ensureUsersSheet_(){
  let s=ss_().getSheetByName(USERS_SHEET_NAME);
  if(!s){s=ss_().insertSheet(USERS_SHEET_NAME);s.appendRow(['ID','Username','Email','FullName','PasswordHash','Salt','Role','CreatedAt','LastLogin','ResetCode','ResetExpiry','Active']);s.setFrozenRows(1);}
  return s;
}
function ensureSessionsSheet_(){
  let s=ss_().getSheetByName(SESSION_SHEET_NAME);
  if(!s){s=ss_().insertSheet(SESSION_SHEET_NAME);s.appendRow(['Token','UserID','Username','CreatedAt','ExpiresAt','IP']);s.setFrozenRows(1);}
  return s;
}
function hashPassword_(pw,salt){
  const bytes=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,pw+salt,Utilities.Charset.UTF_8);
  return bytes.map(b=>('0'+(b&0xff).toString(16)).slice(-2)).join('');
}
function makeSalt_(){return Utilities.getUuid().replace(/-/g,'').slice(0,16);}
function makeToken_(){return Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().replace(/-/g,'');}
function makeResetCode_(){return String(Math.floor(100000+Math.random()*900000));}

function findUser_(q){
  const sheet=ensureUsersSheet_();const lr=sheet.getLastRow();if(lr<2)return null;
  const data=sheet.getRange(2,1,lr-1,12).getValues();const qq=String(q).trim().toLowerCase();
  for(let i=0;i<data.length;i++)
    if(String(data[i][1]).toLowerCase()===qq||String(data[i][2]).toLowerCase()===qq)
      return{rowIndex:i+2,data:data[i]};
  return null;
}
function findUserById_(id){
  const sheet=ensureUsersSheet_();const lr=sheet.getLastRow();if(lr<2)return null;
  const data=sheet.getRange(2,1,lr-1,12).getValues();
  for(let i=0;i<data.length;i++)if(String(data[i][0])===String(id))return{rowIndex:i+2,data:data[i]};
  return null;
}
function validateToken_(token){
  if(!token||token.length<10)return null;
  const sheet=ensureSessionsSheet_();const lr=sheet.getLastRow();if(lr<2)return null;
  const data=sheet.getRange(2,1,lr-1,6).getValues();const now=new Date();
  for(let i=0;i<data.length;i++){
    if(data[i][0]===token){
      const exp=data[i][4] instanceof Date?data[i][4]:new Date(data[i][4]);
      if(isNaN(exp)||exp<now)return null;
      const user=findUserById_(data[i][1]);
      if(!user||String(user.data[11])==='false'||user.data[11]===false)return null;
      return{userId:data[i][1],username:data[i][2],name:user.data[3],role:user.data[6]};
    }
  }
  return null;
}
function writeToken_(userId,username){
  const sheet=ensureSessionsSheet_();const token=makeToken_();const now=new Date();
  const exp=new Date(now.getTime()+TOKEN_TTL_HOURS*3600000);
  sheet.appendRow([token,userId,username,now,exp,'']);
  try{if(sheet.getLastRow()>200)pruneExpiredSessions_();}catch(e){}
  return token;
}
function pruneExpiredSessions_(){
  const sheet=ss_().getSheetByName(SESSION_SHEET_NAME);if(!sheet||sheet.getLastRow()<2)return;
  const now=new Date();const data=sheet.getRange(2,1,sheet.getLastRow()-1,6).getValues();
  for(let i=data.length-1;i>=0;i--){const exp=data[i][4] instanceof Date?data[i][4]:new Date(data[i][4]);if(!isNaN(exp)&&exp<now)sheet.deleteRow(i+2);}
}

/********** AUTH API **********/
function authRegisterAPI(fullName,email,username,password){
  try{
    fullName=String(fullName||'').trim();email=String(email||'').trim().toLowerCase();
    username=String(username||'').trim().toLowerCase();password=String(password||'');
    if(!fullName||!email||!username||!password)return{success:false,error:'All fields are required.'};
    if(password.length<8)return{success:false,error:'Password must be at least 8 characters.'};
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return{success:false,error:'Invalid email address.'};
    if(!/^[a-z0-9._-]{3,}$/.test(username))return{success:false,error:'Username must be 3+ characters (letters, numbers, . _ -).'};
    ensureUsersSheet_();
    if(findUser_(username))return{success:false,error:'Username already taken.'};
    if(findUser_(email))return{success:false,error:'An account with that email already exists.'};
    const sheet=ss_().getSheetByName(USERS_SHEET_NAME);
    const id='U'+Date.now();const salt=makeSalt_();const hash=hashPassword_(password,salt);
    const role=sheet.getLastRow()<=1?'admin':'staff';
    sheet.appendRow([id,username,email,fullName,hash,salt,role,new Date(),'','','',true]);
    return{success:true};
  }catch(err){Logger.log('authRegisterAPI ERROR: '+err);return{success:false,error:String(err)};}
}
function authLoginAPI(usernameOrEmail,password){
  try{
    const q=String(usernameOrEmail||'').trim();const p=String(password||'');
    if(!q||!p)return{success:false,error:'Username and password are required.'};
    const user=findUser_(q);if(!user)return{success:false,error:'Invalid username or password.'};
    const d=user.data;
    if(String(d[11])==='false'||d[11]===false)return{success:false,error:'This account has been deactivated.'};
    if(hashPassword_(p,d[5])!==d[4])return{success:false,error:'Invalid username or password.'};
    ss_().getSheetByName(USERS_SHEET_NAME).getRange(user.rowIndex,9).setValue(new Date());
    const token=writeToken_(d[0],d[1]);
    return{success:true,token,name:d[3],username:d[1],role:d[6],redirect:'?page=kiosk'};
  }catch(err){Logger.log('authLoginAPI ERROR: '+err);return{success:false,error:'Server error. Please try again.'};}
}
function authValidateTokenAPI(token){
  try{const info=validateToken_(String(token||''));if(!info)return{valid:false};return{valid:true,name:info.name,username:info.username,role:info.role};}
  catch(err){return{valid:false};}
}
function authLogoutAPI(token){
  try{
    const sheet=ss_().getSheetByName(SESSION_SHEET_NAME);if(!sheet||sheet.getLastRow()<2)return{success:true};
    const data=sheet.getRange(2,1,sheet.getLastRow()-1,1).getValues();
    for(let i=0;i<data.length;i++){if(data[i][0]===token){sheet.deleteRow(i+2);break;}}
    return{success:true};
  }catch(err){return{success:false};}
}
function authForgotPasswordAPI(email){
  try{
    email=String(email||'').trim().toLowerCase();
    const user=findUser_(email);if(!user)return{success:false,error:'No account found with that email address.'};
    const code=makeResetCode_();const expires=new Date(Date.now()+RESET_CODE_TTL_MIN*60000);
    const sheet=ss_().getSheetByName(USERS_SHEET_NAME);
    sheet.getRange(user.rowIndex,10).setValue(code);sheet.getRange(user.rowIndex,11).setValue(expires);
    MailApp.sendEmail({to:email,subject:'SRFC Youth — Password Reset Code',
      body:'Hi '+user.data[3]+',\n\nYour 6-digit password reset code is:\n\n    '+code+'\n\nThis code expires in '+RESET_CODE_TTL_MIN+' minutes.\n\nIf you did not request this, please ignore this email.\n\n— SRFC Youth System'});
    return{success:true};
  }catch(err){Logger.log('authForgotPasswordAPI ERROR: '+err);return{success:false,error:'Could not send reset email. Please check the address.'};}
}
function authResetPasswordAPI(email,code,newPassword){
  try{
    email=String(email||'').trim().toLowerCase();code=String(code||'').trim();newPassword=String(newPassword||'');
    if(!email||!code||!newPassword)return{success:false,error:'All fields are required.'};
    if(newPassword.length<8)return{success:false,error:'New password must be at least 8 characters.'};
    const user=findUser_(email);if(!user)return{success:false,error:'Account not found.'};
    const d=user.data;const stored=String(d[9]||'').trim();const expiry=d[10];
    if(!stored||stored!==code)return{success:false,error:'Incorrect reset code.'};
    const expiresDate=expiry instanceof Date?expiry:new Date(expiry);
    if(isNaN(expiresDate)||expiresDate<new Date())return{success:false,error:'This code has expired. Please request a new one.'};
    const sheet=ss_().getSheetByName(USERS_SHEET_NAME);const salt=makeSalt_();
    sheet.getRange(user.rowIndex,5).setValue(hashPassword_(newPassword,salt));
    sheet.getRange(user.rowIndex,6).setValue(salt);
    sheet.getRange(user.rowIndex,10).setValue('');sheet.getRange(user.rowIndex,11).setValue('');
    const sessSheet=ss_().getSheetByName(SESSION_SHEET_NAME);
    if(sessSheet&&sessSheet.getLastRow()>=2){
      const rows=sessSheet.getRange(2,1,sessSheet.getLastRow()-1,2).getValues();
      for(let i=rows.length-1;i>=0;i--)if(String(rows[i][1])===String(d[0]))sessSheet.deleteRow(i+2);
    }
    return{success:true};
  }catch(err){Logger.log('authResetPasswordAPI ERROR: '+err);return{success:false,error:'Server error. Please try again.'};}
}
function authChangePasswordAPI(token,currentPassword,newPassword){
  try{
    const info=validateToken_(token);if(!info)return{success:false,error:'Session expired. Please sign in again.'};
    const user=findUser_(info.username);if(!user)return{success:false,error:'User not found.'};
    const d=user.data;if(hashPassword_(currentPassword,d[5])!==d[4])return{success:false,error:'Current password is incorrect.'};
    if(newPassword.length<8)return{success:false,error:'New password must be at least 8 characters.'};
    const salt=makeSalt_();const sheet=ss_().getSheetByName(USERS_SHEET_NAME);
    sheet.getRange(user.rowIndex,5).setValue(hashPassword_(newPassword,salt));sheet.getRange(user.rowIndex,6).setValue(salt);
    return{success:true};
  }catch(err){return{success:false,error:String(err)};}
}

/** Run ONCE in Apps Script editor to create auth sheets */
function setupAuthSheets(){ensureUsersSheet_();ensureSessionsSheet_();Logger.log('Auth sheets ready. Visit ?page=auth to register your first account.');}

/********** ENTRY POINTS **********/
function doGet(e){
  try{maybeAutoArchive_();}catch(err){Logger.log('autoArchive error (non-fatal): '+err);}
  // Everything is in index.html — single page app
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Bolt Kiosk')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function doPost(e){
  try{
    const body=JSON.parse(e.postData.contents);
    const fn=body.fn;
    const args=body.args||[];
    const allowed=['authLoginAPI','authRegisterAPI','authLogoutAPI','authValidateTokenAPI',
      'authForgotPasswordAPI','authResetPasswordAPI','searchStudentsAPI','getAllStudentsAPI',
      'addNewStudentAPI','editStudentAPI','deleteStudentAPI','uploadPhotoAPI','checkInAPI',
      'batchCheckInAPI','getCheckInsTodayAPI','getDashboardData','getWeeklyCheckInsAPI','getWeeklyReportForPWA',
      'getLeaders','addLeaderAPI','getAnalyticsData','getAtRiskStudents','getStudentAttendanceHistory',
      'getFamiliesAPI','searchFamiliesAPI','addFamilyAPI','addChildAPI','editFamilyAPI',
      'editChildAPI','deleteFamilyAPI','deleteChildAPI','checkInFamilyAPI',
      'getVolunteersAPI','addVolunteerAPI','editVolunteerAPI','deleteVolunteerAPI',
      'checkInVolunteerAPI','getVolunteerCheckInsAPI','getDepartmentsAPI',
      'addDepartmentAPI','deleteDepartmentAPI','getVolunteerDashboardAPI'];
    if(!allowed.includes(fn)) return cors({error:'Not allowed'});
    const result=this[fn](...args);
    return cors(result);
  }catch(err){
    return cors({success:false,error:String(err)});
  }
}

function cors(data){
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getDashboardData(){
  try{
    const checkins=getTodaysCheckIns();
    const students=checkins.filter(c=>c.role!=='leader'&&c.type!=='leader');
    const leaders=checkins.filter(c=>c.role==='leader'||c.type==='leader');
    const isNew=(c)=>c.firstTime||c.isNew||c.neverSeenBefore;
    const allStudents=getAllStudentsAPI();
    let atRiskCount=0;
    try{const ar=getAtRiskStudents();atRiskCount=(ar.twoWeeks||[]).filter(s=>s.fullName&&s.fullName.trim()).length;}catch(e){}
    return{
      checkins,
      totalToday:students.length,
      totalStudents:allStudents.length,
      totalLeaders:leaders.length,
      newToday:students.filter(isNew).length,
      atRisk:atRiskCount,
      birthdays:getUpcomingBirthdays(14)
    };
  }catch(err){Logger.log('getDashboardData ERROR: '+err);return{checkins:[],totalToday:0,totalStudents:0,totalLeaders:0,newToday:0,atRisk:0,birthdays:[]};}
}

/********** UTILS **********/
function jsonResponse(obj){const out=ContentService.createTextOutput(JSON.stringify(obj));out.setMimeType(ContentService.MimeType.JSON);return out;}

/********** PHOTO UPLOAD **********/
function uploadStudentPhoto(base64DataUrl,studentName){
  try{
    if(!base64DataUrl||!base64DataUrl.includes(','))return'';
    if(!PHOTO_FOLDER_ID||PHOTO_FOLDER_ID==='YOUR_DRIVE_FOLDER_ID_HERE')return'';
    const folder=DriveApp.getFolderById(PHOTO_FOLDER_ID);
    const base64=base64DataUrl.split(',')[1];
    const filename=(studentName||'student').replace(/[^a-zA-Z0-9_\- ]/g,'')+'_'+Date.now()+'.jpg';
    const blob=Utilities.newBlob(Utilities.base64Decode(base64),'image/jpeg',filename);
    const file=folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);
    return'https://lh3.googleusercontent.com/d/'+file.getId();
  }catch(err){Logger.log('uploadStudentPhoto ERROR: '+err);return'';}
}
function uploadPhotoAPI(base64DataUrl,studentName){
  try{
    if(!base64DataUrl||base64DataUrl.length<100)return{success:false,url:'',error:'No photo data'};
    const url=uploadStudentPhoto(base64DataUrl,studentName);
    return url?{success:true,url}:{success:false,url:'',error:'Upload returned empty URL'};
  }catch(err){return{success:false,url:'',error:String(err)};}
}

/********** PUBLIC API **********/
function searchStudentsAPI(query){return searchStudents(query)||[];}
function checkInAPI(student,meta){return writeCheckIn(student,meta);}
function getCheckInsTodayAPI(){
  try{
    const raw=getTodaysCheckIns();
    return raw.map(r=>({
      ...r,
      name:r.fullName||(r.firstName||'')+' '+(r.lastName||''),
      type:r.role==='leader'?'leader':'student',
      time:r.timestamp||r.time||'',
      isNew:r.firstTime||r.isNew||false,
    }));
  }catch(e){return[];}
}
function batchCheckInAPI(students,meta){
  const results=[];
  (students||[]).forEach(student=>{try{results.push({id:student.id,result:writeCheckIn(student,meta)});}catch(e){results.push({id:student.id,result:{status:'error',message:String(e)}});}});
  return results;
}

/********** ADD NEW STUDENT **********/
function addNewStudentAPI(student,meta){
  try{
    const sheet=ss_().getSheetByName(STUDENTS_SHEET_NAME);if(!sheet)throw new Error('Students sheet not found');
    const existingHeaders=sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0].map(h=>String(h).trim().toLowerCase());
    ['Birthday','Photo URL','Student Phone','EC Name','EC Phone','Allergies'].forEach(col=>{if(!existingHeaders.includes(col.toLowerCase()))sheet.getRange(1,sheet.getLastColumn()+1).setValue(col);});
    const{map}=getHeaderMap_(STUDENTS_SHEET_NAME);
    const id=student.id||('S'+Date.now());student.id=id;
    const numCols=sheet.getLastColumn();const row=new Array(numCols).fill('');
    const sf=(h,v)=>{const idx=map[h];if(idx!=null&&idx<numCols)row[idx]=v??'';};
    sf('id',id);sf('first name',student.firstName||'');sf('last name',student.lastName||'');
    sf('grade',student.grade||'');sf('birthday',student.birthday||'');
    sf('student phone',student.studentPhone||'');sf('ec name',student.ecName||'');
    sf('ec phone',student.ecPhone||'');sf('photo url',student.photoUrl||'');sf('allergies',student.allergies||'');
    sheet.appendRow(row);cacheRemove_('students_all');cacheRemove_('birthdays');
    return writeCheckIn({id,first:student.firstName,last:student.lastName,fullName:(student.firstName+' '+student.lastName).trim(),grade:student.grade,photoUrl:student.photoUrl||''},meta);
  }catch(err){Logger.log('addNewStudentAPI ERROR: '+err);return{status:'error',message:String(err)};}
}

/********** EDIT / DELETE STUDENT **********/
function editStudentAPI(studentId,updates){
  try{
    const{sheet,map}=getHeaderMap_(STUDENTS_SHEET_NAME);const lastRow=sheet.getLastRow();if(lastRow<2)return{success:false,error:'No students found'};
    const idIdx=map['id']??map['student id']??null;if(idIdx===null)return{success:false,error:'No ID column'};
    const numCols=sheet.getLastColumn();const values=sheet.getRange(2,1,lastRow-1,numCols).getValues();
    let rowIndex=-1;for(let i=0;i<values.length;i++){if(String(values[i][idIdx]).trim()===String(studentId).trim()){rowIndex=i+2;break;}}
    if(rowIndex===-1)return{success:false,error:'Student not found: '+studentId};
    const rowData=values[rowIndex-2].slice();
    const fieldMap={firstName:'first name',lastName:'last name',grade:'grade',birthday:'birthday',studentPhone:'student phone',ecName:'ec name',ecPhone:'ec phone',photoUrl:'photo url',allergies:'allergies'};
    Object.entries(updates).forEach(([k,v])=>{const col=fieldMap[k];if(!col)return;const idx=map[col];if(idx!=null)rowData[idx]=v??'';});
    sheet.getRange(rowIndex,1,1,rowData.length).setValues([rowData]);
    cacheRemove_('students_all');cacheRemove_('checkins_today');cacheRemove_('birthdays');
    return{success:true};
  }catch(err){Logger.log('editStudentAPI ERROR: '+err);return{success:false,error:String(err)};}
}
function deleteStudentAPI(studentId){
  try{
    const{sheet,map}=getHeaderMap_(STUDENTS_SHEET_NAME);const lastRow=sheet.getLastRow();if(lastRow<2)return{success:false,error:'No students'};
    const idIdx=map['id']??map['student id']??null;if(idIdx===null)return{success:false,error:'No ID column'};
    const values=sheet.getRange(2,1,lastRow-1,sheet.getLastColumn()).getValues();
    let rowIndex=-1;for(let i=0;i<values.length;i++){if(String(values[i][idIdx]).trim()===String(studentId).trim()){rowIndex=i+2;break;}}
    if(rowIndex===-1)return{success:false,error:'Student not found'};
    sheet.deleteRow(rowIndex);cacheRemove_('students_all');cacheRemove_('checkins_today');
    return{success:true};
  }catch(err){Logger.log('deleteStudentAPI ERROR: '+err);return{success:false,error:String(err)};}
}

/********** GET ALL STUDENTS **********/
function getAllStudentsAPI(){
  const cached=cacheGet_('students_all');if(cached)return cached;
  try{
    const{sheet,map}=getHeaderMap_(STUDENTS_SHEET_NAME);const lastRow=sheet.getLastRow();if(lastRow<2)return[];
    const numCols=sheet.getLastColumn();const values=sheet.getRange(2,1,lastRow-1,numCols).getValues();
    const idxId=map['id']??map['student id']??null;const idxFirst=map['first name'];const idxLast=map['last name'];
    const idxGrade=map['grade']??null;const idxBday=map['birthday']??null;const idxPhoto=map['photo url']??null;
    const idxSPhone=map['student phone']??null;const idxECN=map['ec name']??null;const idxECP=map['ec phone']??null;const idxAllergy=map['allergies']??null;
    function parseBdayStr(rawBday){
      if(!rawBday)return'';
      if(rawBday instanceof Date)return rawBday.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
      const s=String(rawBday).trim().replace(/--+/,'-');const m=s.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if(m){let yr=+m[1],p2=+m[2],p3=+m[3],mm,dd;if(p2>12){mm=p3;dd=p2;}else{mm=p2;dd=p3;}if(mm<1||mm>12||dd<1||dd>31)return s;return new Date(Date.UTC(yr,mm-1,dd,12)).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});}
      return s;
    }
    const result=values.map((row,i)=>{
      const rawId=idxId!=null?row[idxId]:(i+2);
      return{id:rawId instanceof Date?String(rawId.getTime()):String(rawId||''),firstName:String(row[idxFirst]||''),lastName:String(row[idxLast]||''),grade:idxGrade!=null?String(row[idxGrade]||''):'',birthday:parseBdayStr(idxBday!=null?row[idxBday]:''),photoUrl:idxPhoto!=null?String(row[idxPhoto]||''):'',studentPhone:idxSPhone!=null?String(row[idxSPhone]||''):'',ecName:idxECN!=null?String(row[idxECN]||''):'',ecPhone:idxECP!=null?String(row[idxECP]||''):'',allergies:idxAllergy!=null?String(row[idxAllergy]||''):'',rowNumber:i+2};
    }).filter(s=>s.firstName||s.lastName);
    cachePut_('students_all',result,CACHE_TTL_STUDENTS);return result;
  }catch(err){Logger.log('getAllStudentsAPI ERROR: '+err);return[];}
}

/********** LEADERS **********/
function getLeaders(){const sheet=ss_().getSheetByName('Leaders');if(!sheet||sheet.getLastRow()<2)return[];return sheet.getRange(2,1,sheet.getLastRow()-1,1).getValues().map(r=>r[0]).filter(Boolean);}
function addLeaderAPI(name){
  try{
    name=(name||'').trim();if(!name)return{success:false,error:'Name is required.'};
    let sheet=ss_().getSheetByName('Leaders');if(!sheet){sheet=ss_().insertSheet('Leaders');sheet.appendRow(['Name']);}
    const lastRow=sheet.getLastRow();
    if(lastRow>=2){const existing=sheet.getRange(2,1,lastRow-1,1).getValues().map(r=>String(r[0]).trim().toLowerCase());if(existing.includes(name.toLowerCase()))return{success:false,error:name+' is already in the leaders list.'};}
    sheet.appendRow([name]);return{success:true,name};
  }catch(e){Logger.log('addLeaderAPI ERROR: '+e);return{success:false,error:String(e)};}
}

/********** SEARCH **********/
function searchStudents(query){
  const normQuery=normalize_(query);if(!normQuery)return[];
  const exact=[],contains=[];
  getAllStudentsAPI().forEach(s=>{
    const nFirst=normalize_(s.firstName),nLast=normalize_(s.lastName);
    const full=nFirst+' '+nLast,rev=nLast+' '+nFirst;
    const c={id:s.id,firstName:s.firstName,lastName:s.lastName,fullName:(s.firstName+' '+s.lastName).trim(),grade:s.grade,birthday:s.birthday,photoUrl:s.photoUrl,studentPhone:s.studentPhone,ecName:s.ecName,ecPhone:s.ecPhone,allergies:s.allergies};
    if(normQuery===nFirst||normQuery===nLast||normQuery===full||normQuery===rev)exact.push(c);
    else if(nFirst.includes(normQuery)||nLast.includes(normQuery)||full.includes(normQuery)||rev.includes(normQuery))contains.push(c);
  });
  return exact.length>0?exact:contains;
}

/********** WRITE CHECK-IN **********/
function writeCheckIn(student,meta){
  const{sheet,map}=getHeaderMap_(CHECKINS_SHEET_NAME);
  if(map['role']==null){sheet.getRange(1,sheet.getLastColumn()+1).setValue('Role');map['role']=sheet.getLastColumn()-1;}
  if(map['student id']==null){sheet.getRange(1,sheet.getLastColumn()+1).setValue('Student ID');map['student id']=sheet.getLastColumn()-1;}
  if(map['event']==null){sheet.getRange(1,sheet.getLastColumn()+1).setValue('Event');map['event']=sheet.getLastColumn()-1;}
  const now=new Date(),today=now.toDateString();
  const data=sheet.getDataRange().getValues(),headers=data[0];
  const idxId=map['student id'],idxDate=map['timestamp'],idxFull=map['full name'];
  const already=data.slice(1).some(row=>{
    const ts=row[idxDate];if(!ts)return false;
    const rd=(ts instanceof Date?ts:new Date(ts)).toDateString();if(rd!==today)return false;
    if(student.id&&row[idxId]&&String(row[idxId])===String(student.id))return true;
    if(student.fullName&&idxFull!=null&&String(row[idxFull]).trim().toLowerCase()===student.fullName.trim().toLowerCase())return true;
    return false;
  });
  if(already)return{status:'already',message:'Already checked in today'};
  const row=new Array(headers.length).fill('');
  const sf=(h,v)=>{const idx=map[String(h).toLowerCase()];if(idx!=null)row[idx]=v;};
  sf('timestamp',now);sf('student id',student.id);sf('first name',student.first||student.firstName);sf('last name',student.last||student.lastName);sf('full name',student.fullName);sf('grade',student.grade);sf('role',(meta&&meta.role)?meta.role:'Student');
  if(meta){if(meta.kioskName)sf('kiosk',meta.kioskName);if(meta.leaderName)sf('leader',meta.leaderName);if(meta.eventName)sf('event',meta.eventName);}
  sheet.appendRow(row);cacheRemove_('checkins_today');
  return{status:'success',timestamp:now.toISOString()};
}

/********** STUDENT LOOKUP MAP **********/
function buildStudentLookup_(){
  const lookup={};
  getAllStudentsAPI().forEach(s=>{
    const d={id:s.id,photoUrl:s.photoUrl,studentPhone:s.studentPhone,ecName:s.ecName,ecPhone:s.ecPhone,birthday:s.birthday,allergies:s.allergies};
    const first=s.firstName.toLowerCase(),last=s.lastName.toLowerCase(),full=(s.firstName+' '+s.lastName).toLowerCase();
    if(s.id)lookup[s.id.trim()]=d;if(full)lookup[full]=d;if(first&&last)lookup[first+'|'+last]=d;
  });
  return lookup;
}

/********** GET TODAY'S CHECK-INS **********/
function getTodaysCheckIns(){
  const cached=cacheGet_('checkins_today');if(cached)return cached;
  try{
    const{sheet,map}=getHeaderMap_(CHECKINS_SHEET_NAME);const lastRow=sheet.getLastRow();if(lastRow<2)return[];
    const today=new Date().toDateString();const numCols=sheet.getLastColumn();
    const allRows=sheet.getRange(2,1,lastRow-1,numCols).getValues();
    const idxTs=map['timestamp'],idxFull=map['full name'],idxFN=map['first name'],idxLN=map['last name'],idxGr=map['grade'];
    const idxLdr=map['leader']??null,idxSid=map['student id']??null,idxRole=map['role']??null,idxEvt=map['event']??null;
    const todayRows=allRows.filter(row=>{const ts=row[idxTs];return ts&&(ts instanceof Date?ts:new Date(ts)).toDateString()===today;});
    if(!todayRows.length){cachePut_('checkins_today',[],CACHE_TTL_CHECKINS);return[];}
    const studentDetails=buildStudentLookup_();
    const result=todayRows.map(row=>{
      const rawFull=String(row[idxFull]||'').trim(),rawFirst=String(row[idxFN]||'').trim(),rawLast=String(row[idxLN]||'').trim();
      const fullName=rawFull||(rawFirst+' '+rawLast).trim();
      const sid=idxSid!=null?String(row[idxSid]||'').trim():'';
      const role=idxRole!=null?String(row[idxRole]||'Student'):'Student';
      const d=studentDetails[sid]||studentDetails[fullName.toLowerCase()]||studentDetails[(rawFirst+'|'+rawLast).toLowerCase()]||{};
      return{studentId:sid||d.id||'',fullName,grade:row[idxGr]||'',leader:idxLdr!=null?row[idxLdr]:'',role,event:idxEvt!=null?String(row[idxEvt]||''):'',timestamp:(row[idxTs] instanceof Date?row[idxTs]:new Date(row[idxTs])).toISOString(),photoUrl:d.photoUrl||'',studentPhone:d.studentPhone||'',ecName:d.ecName||'',ecPhone:d.ecPhone||'',birthday:d.birthday||'',allergies:d.allergies||''};
    }).reverse();
    cachePut_('checkins_today',result,CACHE_TTL_CHECKINS);return result;
  }catch(err){Logger.log('getTodaysCheckIns ERROR: '+err);return[];}
}

/********** WEEKLY CHECK-INS **********/

/* PWA-friendly weekly report — returns {days:[], weekLabel, totalStudents, topStudents} */
function getWeeklyReportForPWA(offsetWeeks){
  try{
    offsetWeeks=offsetWeeks||0;
    const raw=getWeeklyCheckInsAPI(offsetWeeks);
    const records=raw.records||[];
    // Build day-by-day counts
    const monday=new Date(raw.weekStart);
    const dayNames=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const days=dayNames.map((name,i)=>{
      const date=new Date(monday);date.setDate(monday.getDate()+i);
      const dateStr=date.toLocaleDateString('en-US',{month:'short',day:'numeric'});
      const count=records.filter(r=>{
        const d=new Date(r.timestamp);
        return d.getDate()===date.getDate()&&d.getMonth()===date.getMonth()&&
               r.role!=='leader'&&r.type!=='leader';
      }).length;
      return{label:name+' '+dateStr,date:dateStr,count};
    });
    // Top students (by name frequency)
    const freq={};
    records.filter(r=>r.role!=='leader'&&r.type!=='leader').forEach(r=>{
      const n=r.fullName||'';if(!n)return;
      freq[n]=(freq[n]||{name:n,grade:r.grade,count:0});freq[n].count++;
    });
    const topStudents=Object.values(freq).sort((a,b)=>b.count-a.count).slice(0,10);
    // Week label
    const ws=new Date(raw.weekStart),we=new Date(raw.weekEnd);
    const now=new Date();const diffWeeks=Math.round((now-ws)/604800000);
    const weekLabel=diffWeeks===0?'This Week':diffWeeks===1?'Last Week':
      ws.toLocaleDateString('en-US',{month:'short',day:'numeric'})+' – '+
      we.toLocaleDateString('en-US',{month:'short',day:'numeric'});
    return{days,weekLabel,totalStudents:records.filter(r=>r.role!=='leader').length,topStudents};
  }catch(err){Logger.log('getWeeklyReportForPWA ERROR: '+err);return{days:[],weekLabel:'This Week',totalStudents:0,topStudents:[]};}
}

function getWeeklyCheckInsAPI(offsetWeeks){
  offsetWeeks=offsetWeeks||0;const cacheKey='checkins_week_'+offsetWeeks;const ttl=offsetWeeks===0?30:300;
  const cached=cacheGet_(cacheKey);if(cached)return cached;
  try{
    const now=new Date();const dayOfWeek=now.getDay();
    const monday=new Date(now);monday.setDate(now.getDate()-(dayOfWeek===0?6:dayOfWeek-1)+(offsetWeeks*7));monday.setHours(0,0,0,0);
    const sunday=new Date(monday);sunday.setDate(monday.getDate()+6);sunday.setHours(23,59,59,999);
    const mNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const sheetsToScan=[];const liveSheet=ss_().getSheetByName(CHECKINS_SHEET_NAME);
    if(liveSheet&&liveSheet.getLastRow()>=2)sheetsToScan.push(liveSheet);
    const monthsToCheck=new Set();for(let d=new Date(monday);d<=sunday;d.setDate(d.getDate()+1))monthsToCheck.add(mNames[d.getMonth()]+' '+d.getFullYear());
    monthsToCheck.forEach(shName=>{if(shName===CHECKINS_SHEET_NAME)return;const sh=ss_().getSheetByName(shName);if(sh&&sh.getLastRow()>=2)sheetsToScan.push(sh);});
    const studentDetails=buildStudentLookup_();const results=[];
    sheetsToScan.forEach(sheet=>{
      const lr=sheet.getLastRow();if(lr<2)return;
      const vals=sheet.getRange(1,1,lr,sheet.getLastColumn()).getValues();const hdrs=vals[0];const hmap={};
      hdrs.forEach((h,i)=>{if(h)hmap[String(h).trim().toLowerCase()]=i;});
      const idxTs=hmap['timestamp'];if(idxTs===undefined)return;
      const idxFull=hmap['full name'],idxFN=hmap['first name'],idxLN=hmap['last name'],idxGr=hmap['grade'];
      const idxLdr=hmap['leader']??null,idxSid=hmap['student id']??null,idxRole=hmap['role']??null,idxEvt=hmap['event']??null;
      vals.slice(1).forEach(row=>{
        const ts=row[idxTs];if(!ts)return;const d=ts instanceof Date?ts:new Date(ts);if(isNaN(d))return;if(d<monday||d>sunday)return;
        const rawFull=String(row[idxFull]||'').trim(),rawFirst=String(row[idxFN]||'').trim(),rawLast=String(row[idxLN]||'').trim();
        const fullName=rawFull||(rawFirst+' '+rawLast).trim();
        const sid=idxSid!=null?String(row[idxSid]||'').trim():'';const role=idxRole!=null?String(row[idxRole]||'Student'):'Student';
        const det=studentDetails[sid]||studentDetails[fullName.toLowerCase()]||studentDetails[(rawFirst+'|'+rawLast).toLowerCase()]||{};
        results.push({studentId:sid||det.id||'',fullName,grade:row[idxGr]||'',leader:idxLdr!=null?String(row[idxLdr]||''):'',role,event:idxEvt!=null?String(row[idxEvt]||''):'',timestamp:d.toISOString(),photoUrl:det.photoUrl||'',studentPhone:det.studentPhone||'',ecName:det.ecName||'',ecPhone:det.ecPhone||'',birthday:det.birthday||'',allergies:det.allergies||''});
      });
    });
    results.sort((a,b)=>new Date(a.timestamp)-new Date(b.timestamp));
    const payload={records:results,weekStart:monday.toISOString(),weekEnd:sunday.toISOString()};
    cachePut_(cacheKey,payload,ttl);return payload;
  }catch(err){Logger.log('getWeeklyCheckInsAPI ERROR: '+err);return{records:[],weekStart:'',weekEnd:''};}
}

/********** BIRTHDAYS **********/
function getUpcomingBirthdays(daysAhead){
  daysAhead=daysAhead||365;const cached=cacheGet_('birthdays');if(cached)return cached;
  try{
    const{sheet:studSheet,map:studMap}=getHeaderMap_(STUDENTS_SHEET_NAME);const lastRow=studSheet.getLastRow();if(lastRow<2){cachePut_('birthdays',[],300);return[];}
    const numCols=studSheet.getLastColumn();const values=studSheet.getRange(2,1,lastRow-1,numCols).getValues();
    const idxBday=studMap['birthday']??null,idxFirst=studMap['first name'],idxLast=studMap['last name'],idxPhoto=studMap['photo url']??null;
    let tz='America/Chicago';try{const t1=SpreadsheetApp.openById(SPREADSHEET_ID).getSpreadsheetTimeZone();if(t1)tz=t1;}catch(e){try{const t2=Session.getScriptTimeZone();if(t2)tz=t2;}catch(e2){}}
    let todayY,todayM,todayD;try{const s=Utilities.formatDate(new Date(),tz,'yyyy-MM-dd').split('-').map(Number);todayY=s[0];todayM=s[1];todayD=s[2];}catch(e){const n=new Date();todayY=n.getFullYear();todayM=n.getMonth()+1;todayD=n.getDate();}
    function parseBday(raw){
      if(!raw)return null;
      if(raw instanceof Date){const mm=raw.getMonth()+1,dd=raw.getDate();return(mm>=1&&mm<=12&&dd>=1&&dd<=31)?{mm,dd}:null;}
      const s=String(raw).trim().replace(/--+/,'-').replace(/\//g,'-');if(!s)return null;
      const m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if(m){const p2=+m[2],p3=+m[3];let mm,dd;if(p2>12){mm=p3;dd=p2;}else if(p3>12){mm=p2;dd=p3;}else{mm=p2;dd=p3;}return(mm>=1&&mm<=12&&dd>=1&&dd<=31)?{mm,dd}:null;}
      const d=new Date(s);if(!isNaN(d)){const mm=d.getMonth()+1,dd=d.getDate();return(mm>=1&&mm<=12&&dd>=1&&dd<=31)?{mm,dd}:null;}return null;
    }
    const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
    const upcoming=[];
    values.forEach(row=>{
      const first=String(row[idxFirst]||'').trim(),last=String(row[idxLast]||'').trim();if(!first&&!last)return;if(idxBday===null)return;
      const parsed=parseBday(row[idxBday]);if(!parsed)return;const{mm:bdM,dd:bdD}=parsed;
      const isToday=(bdM===todayM&&bdD===todayD);let daysUntil;
      if(isToday){daysUntil=0;}else{const todayMMDD=todayM*100+todayD,bdMMDD=bdM*100+bdD;const useYear=bdMMDD>=todayMMDD?todayY:todayY+1;daysUntil=Math.round((new Date(useYear,bdM-1,bdD)-new Date(todayY,todayM-1,todayD))/86400000);}
      if(daysUntil<0||daysUntil>daysAhead)return;
      upcoming.push({fullName:(first+' '+last).trim(),birthday:MONTHS[bdM-1]+' '+bdD,daysUntil,photoUrl:idxPhoto!=null?String(row[idxPhoto]||''):'',isToday:daysUntil===0});
    });
    upcoming.sort((a,b)=>a.daysUntil-b.daysUntil);cachePut_('birthdays',upcoming,300);return upcoming;
  }catch(err){Logger.log('getUpcomingBirthdays ERROR: '+err);return[];}
}

/********** AUTO-ARCHIVE **********/
function maybeAutoArchive_(){const key='archive_ran_'+new Date().toDateString().replace(/\s/g,'_');if(CacheService.getScriptCache().get(key))return;autoArchiveCheckIns();CacheService.getScriptCache().put(key,'1',86400);}
function autoArchiveCheckIns(){
  const sheet=ss_().getSheetByName(CHECKINS_SHEET_NAME);if(!sheet)return;const lastRow=sheet.getLastRow();if(lastRow<2)return;
  const data=sheet.getRange(1,1,lastRow,sheet.getLastColumn()).getValues();const headers=data[0],rows=data.slice(1);
  const now=new Date();let am=now.getMonth()-1,ay=now.getFullYear();if(am<0){am=11;ay--;}
  const mNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];const aName=mNames[am]+' '+ay;
  let aSheet=ss_().getSheetByName(aName);if(!aSheet){aSheet=ss_().insertSheet(aName);aSheet.appendRow(headers);}
  const tsIdx=headers.map(h=>String(h).toLowerCase()).indexOf('timestamp');if(tsIdx===-1)return;
  const keepRows=[],archiveRows=[];
  rows.forEach(row=>{const ts=new Date(row[tsIdx]);(ts.getMonth()===am&&ts.getFullYear()===ay?archiveRows:keepRows).push(row);});
  if(!archiveRows.length)return;
  aSheet.getRange(aSheet.getLastRow()+1,1,archiveRows.length,archiveRows[0].length).setValues(archiveRows);
  sheet.clearContents();sheet.appendRow(headers);if(keepRows.length)sheet.getRange(2,1,keepRows.length,keepRows[0].length).setValues(keepRows);
  cacheBust_();
}

/********** ARCHIVE SCAN **********/
function getArchiveRecords_(monthsBack){
  const mNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];const now=new Date(),sheets=[];
  const ci=ss_().getSheetByName(CHECKINS_SHEET_NAME);if(ci&&ci.getLastRow()>=2)sheets.push(ci);
  for(let m=0;m<=monthsBack;m++){const d=new Date(now.getFullYear(),now.getMonth()-m,1);const sh=ss_().getSheetByName(mNames[d.getMonth()]+' '+d.getFullYear());if(sh&&sh.getLastRow()>=2)sheets.push(sh);}
  const records=[];
  sheets.forEach(sh=>{
    const lr=sh.getLastRow();const vals=sh.getRange(1,1,lr,sh.getLastColumn()).getValues();
    const hdrs=vals[0].map(h=>String(h).trim().toLowerCase());const idxTs=hdrs.indexOf('timestamp');if(idxTs===-1)return;const idxRole=hdrs.indexOf('role');
    vals.slice(1).forEach(row=>{if(idxRole!==-1&&String(row[idxRole]||'').toLowerCase()==='leader')return;const ts=row[idxTs];if(!ts)return;const d=ts instanceof Date?ts:new Date(ts);if(isNaN(d))return;records.push(d);});
  });
  return records;
}

/********** ANALYTICS **********/
function getAnalyticsData(){return{weekly:getWeeklyAttendance(12),monthly:getMonthlyAttendance(6)};}
function getWeeklyAttendance(weeksBack){
  weeksBack=weeksBack||12;const cached=cacheGet_('analytics_weekly');if(cached)return cached;
  try{
    const now=new Date(),weeks=[];
    for(let w=0;w<weeksBack;w++){const end=new Date(now);end.setDate(end.getDate()-w*7);end.setHours(23,59,59,999);const start=new Date(end);start.setDate(start.getDate()-end.getDay());start.setHours(0,0,0,0);const realEnd=new Date(start);realEnd.setDate(realEnd.getDate()+6);realEnd.setHours(23,59,59,999);weeks.push({start,end:realEnd,count:0,label:start.toLocaleDateString('en-US',{month:'short',day:'numeric'})});}
    getArchiveRecords_(Math.ceil(weeksBack/4)+1).forEach(d=>{weeks.forEach(w=>{if(d>=w.start&&d<=w.end)w.count++;});});
    const result=weeks.reverse().map(w=>({label:w.label,count:w.count}));cachePut_('analytics_weekly',result,CACHE_TTL_ANALYTICS);return result;
  }catch(err){Logger.log('getWeeklyAttendance ERROR: '+err);return[];}
}
function getMonthlyAttendance(monthsBack){
  monthsBack=monthsBack||6;const cached=cacheGet_('analytics_monthly');if(cached)return cached;
  try{
    const mNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];const now=new Date(),months=[];
    for(let m=0;m<monthsBack;m++){const d=new Date(now.getFullYear(),now.getMonth()-m,1);months.push({start:new Date(d.getFullYear(),d.getMonth(),1),end:new Date(d.getFullYear(),d.getMonth()+1,0,23,59,59,999),label:mNames[d.getMonth()]+' '+d.getFullYear(),count:0,byWeek:{1:0,2:0,3:0,4:0}});}
    getArchiveRecords_(monthsBack+1).forEach(d=>{months.forEach(mo=>{if(d>=mo.start&&d<=mo.end){mo.count++;mo.byWeek[Math.min(4,Math.ceil(d.getDate()/7))]++;}});});
    const result=months.reverse().map(m=>({label:m.label,count:m.count,byWeek:m.byWeek}));cachePut_('analytics_monthly',result,CACHE_TTL_ANALYTICS);return result;
  }catch(err){Logger.log('getMonthlyAttendance ERROR: '+err);return[];}
}

/********** AT-RISK **********/
function getAtRiskStudents(){
  const cached=cacheGet_('atrisk');if(cached)return cached;
  try{
    const now=new Date(),twoWeeksAgo=new Date(now.getTime()-14*86400000),oneMonthAgo=new Date(now.getTime()-30*86400000);
    const mNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],sheetsToScan=[];
    const liveSheet=ss_().getSheetByName(CHECKINS_SHEET_NAME);if(liveSheet&&liveSheet.getLastRow()>=2)sheetsToScan.push(liveSheet);
    for(let m=0;m<=3;m++){const d=new Date(now.getFullYear(),now.getMonth()-m,1);const sh=ss_().getSheetByName(mNames[d.getMonth()]+' '+d.getFullYear());if(sh&&sh.getLastRow()>=2)sheetsToScan.push(sh);}
    const lastSeenMap={};
    const setIfNewer=(key,date)=>{if(!key)return;const k=String(key).trim().toLowerCase();if(!k)return;if(!lastSeenMap[k]||date>lastSeenMap[k])lastSeenMap[k]=date;};
    sheetsToScan.forEach(sh=>{
      const lr=sh.getLastRow();if(lr<2)return;const vals=sh.getRange(1,1,lr,sh.getLastColumn()).getValues();
      const hdrs=vals[0].map(h=>String(h).trim().toLowerCase());const idxTs=hdrs.indexOf('timestamp');if(idxTs===-1)return;
      const idxId=hdrs.indexOf('student id'),idxFull=hdrs.indexOf('full name'),idxFN=hdrs.indexOf('first name'),idxLN=hdrs.indexOf('last name'),idxRole=hdrs.indexOf('role');
      vals.slice(1).forEach(row=>{
        if(idxRole!==-1&&String(row[idxRole]||'').trim().toLowerCase()==='leader')return;
        const ts=row[idxTs];if(!ts)return;const d=ts instanceof Date?ts:new Date(ts);if(isNaN(d))return;
        const sid=idxId!==-1?String(row[idxId]||'').trim():'',full=idxFull!==-1?String(row[idxFull]||'').trim():'';
        const fname=idxFN!==-1?String(row[idxFN]||'').trim():'',lname=idxLN!==-1?String(row[idxLN]||'').trim():'';
        setIfNewer(sid,d);setIfNewer(full,d);setIfNewer((fname+' '+lname).trim(),d);if(fname&&lname)setIfNewer(fname+'|'+lname,d);
      });
    });
    const atRisk2w=[],atRisk1m=[];
    getAllStudentsAPI().forEach(s=>{
      if(!s.firstName&&!s.lastName)return;const name=(s.firstName+' '+s.lastName).trim();
      const rec=lastSeenMap[String(s.id||'').trim().toLowerCase()]||lastSeenMap[name.toLowerCase()]||lastSeenMap[(s.firstName+'|'+s.lastName).toLowerCase()]||null;
      const daysSince=rec?Math.floor((now-rec)/86400000):null;
      const entry={studentId:s.id,name:name,fullName:name,grade:s.grade,photoUrl:s.photoUrl,lastSeen:rec?rec.toISOString():null,daysSince,neverSeen:!rec,attendanceRate:0,rate:0};
      if(!rec||rec<twoWeeksAgo)atRisk2w.push(entry);if(!rec||rec<oneMonthAgo)atRisk1m.push(entry);
    });
    const sortFn=(a,b)=>{if(a.neverSeen!==b.neverSeen)return a.neverSeen?-1:1;return(b.daysSince||0)-(a.daysSince||0);};
    atRisk2w.sort(sortFn);atRisk1m.sort(sortFn);
    const result={twoWeeks:atRisk2w,oneMonth:atRisk1m};cachePut_('atrisk',result,CACHE_TTL_ATRISK);return result;
  }catch(err){Logger.log('getAtRiskStudents ERROR: '+err);return{twoWeeks:[],oneMonth:[]};}
}

/********** STUDENT ATTENDANCE HISTORY **********/
function getStudentAttendanceHistory(studentId,studentName){
  try{
    const mNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];const now=new Date(),sheetsToScan=[];
    const ci=ss_().getSheetByName(CHECKINS_SHEET_NAME);if(ci)sheetsToScan.push(ci);
    for(let m=0;m<=11;m++){const d=new Date(now.getFullYear(),now.getMonth()-m,1);const sh=ss_().getSheetByName(mNames[d.getMonth()]+' '+d.getFullYear());if(sh)sheetsToScan.push(sh);}
    const records=[],normName=normalize_(studentName||''),normId=String(studentId||'').trim();
    sheetsToScan.forEach(sh=>{
      const lr=sh.getLastRow();if(lr<2)return;const vals=sh.getRange(1,1,lr,sh.getLastColumn()).getValues();
      const hdrs=vals[0].map(h=>String(h).trim().toLowerCase());const idxTs=hdrs.indexOf('timestamp');if(idxTs===-1)return;
      const idxId=hdrs.indexOf('student id'),idxFull=hdrs.indexOf('full name'),idxFN=hdrs.indexOf('first name'),idxLN=hdrs.indexOf('last name');
      const idxLdr=hdrs.indexOf('leader'),idxRole=hdrs.indexOf('role');
      vals.slice(1).forEach(row=>{
        if(idxRole!==-1&&String(row[idxRole]||'').toLowerCase()==='leader')return;
        const ts=row[idxTs];if(!ts)return;const d=ts instanceof Date?ts:new Date(ts);if(isNaN(d))return;
        const rowId=idxId!==-1?String(row[idxId]||'').trim():'';
        const rowFull=idxFull!==-1?String(row[idxFull]||'').trim().toLowerCase():'';
        const rowComb=(idxFN!==-1&&idxLN!==-1)?(String(row[idxFN]||'')+' '+String(row[idxLN]||'')).trim().toLowerCase():'';
        if((normId&&rowId===normId)||(normName&&(rowFull===normName||rowComb===normName)))
          records.push({timestamp:d.toISOString(),leader:idxLdr!==-1?String(row[idxLdr]||''):''});
      });
    });
    records.sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));return records;
  }catch(err){Logger.log('getStudentAttendanceHistory ERROR: '+err);return[];}
}

/********** DEBUG **********/
function debugBirthdays(){cacheBust_();const r=getUpcomingBirthdays(365);Logger.log('Birthdays: '+r.length);r.forEach(b=>Logger.log(b.fullName+' | '+b.birthday+' | '+b.daysUntil+'d'));}
function testAnalytics(){Logger.log(JSON.stringify(getWeeklyAttendance(12)));}
function debugSheetNames(){ss_().getSheets().forEach(sh=>Logger.log('"'+sh.getName()+'" rows:'+sh.getLastRow()));}
function clearAllCache(){cacheBust_();Logger.log('Cache cleared.');}

/* ═══════════════════════════════════════════════════════════
   CHILDREN'S MINISTRY — Family Registry
   Sheets: Families, Children
═══════════════════════════════════════════════════════════ */

const FAMILIES_SHEET   = 'Families';
const CM_CHILDREN_SHEET = 'CM_Children';

function ensureFamilySheets_() {
  const ss = ss_();
  // Families sheet
  if (!ss.getSheetByName(FAMILIES_SHEET)) {
    const sh = ss.insertSheet(FAMILIES_SHEET);
    sh.appendRow(['FamilyID','ParentName','Phone','Email','Address','Notes','CreatedAt']);
    sh.setFrozenRows(1);
  }
  // CM_Children sheet
  if (!ss.getSheetByName(CM_CHILDREN_SHEET)) {
    const sh = ss.insertSheet(CM_CHILDREN_SHEET);
    sh.appendRow(['ChildID','FamilyID','ParentName','FirstName','LastName','Grade','DOB','Allergies','Notes','Room','CreatedAt']);
    sh.setFrozenRows(1);
  }
}

/* ── GET ALL FAMILIES ── */
function getFamiliesAPI() {
  try {
    ensureFamilySheets_();
    const ss = ss_();
    const fSheet = ss.getSheetByName(FAMILIES_SHEET);
    const cSheet = ss.getSheetByName(CM_CHILDREN_SHEET);
    if (!fSheet || fSheet.getLastRow() < 2) return { families: [] };

    const fRows = fSheet.getRange(2, 1, fSheet.getLastRow() - 1, 7).getValues();
    const families = fRows
      .filter(r => r[0])
      .map(r => ({
        id:         String(r[0]),
        parentName: String(r[1] || ''),
        phone:      String(r[2] || ''),
        email:      String(r[3] || ''),
        address:    String(r[4] || ''),
        notes:      String(r[5] || ''),
        createdAt:  r[6] ? String(r[6]) : '',
        children:   []
      }));

    if (cSheet && cSheet.getLastRow() > 1) {
      const cRows = cSheet.getRange(2, 1, cSheet.getLastRow() - 1, 11).getValues();
      cRows.filter(r => r[0]).forEach(r => {
        const fam = families.find(f => f.id === String(r[1]));
        if (fam) fam.children.push({
          id:         String(r[0]),
          familyId:   String(r[1]),
          parentName: String(r[2] || ''),
          firstName:  String(r[3] || ''),
          lastName:   String(r[4] || ''),
          name:       (String(r[3]||'') + ' ' + String(r[4]||'')).trim(),
          grade:      String(r[5] || ''),
          dob:        r[6] ? String(r[6]) : '',
          allergies:  String(r[7] || ''),
          notes:      String(r[8] || ''),
          room:       String(r[9] || ''),
        });
      });
    }
    return { families };
  } catch(e) {
    Logger.log('getFamiliesAPI error: ' + e);
    return { families: [], error: String(e) };
  }
}

/* ── SEARCH FAMILIES by name or phone ── */
function searchFamiliesAPI(query) {
  try {
    const { families } = getFamiliesAPI();
    const q = String(query || '').toLowerCase().trim();
    if (!q) return { families };
    const results = families.filter(f =>
      f.parentName.toLowerCase().includes(q) ||
      f.phone.replace(/\D/g,'').includes(q.replace(/\D/g,'')) ||
      f.email.toLowerCase().includes(q) ||
      f.children.some(c => c.name.toLowerCase().includes(q))
    );
    return { families: results };
  } catch(e) { return { families: [], error: String(e) }; }
}

/* ── ADD FAMILY ── */
function addFamilyAPI(family) {
  try {
    ensureFamilySheets_();
    const ss    = ss_();
    const sheet = ss.getSheetByName(FAMILIES_SHEET);
    const id    = 'F' + Date.now();
    sheet.appendRow([
      id,
      family.parentName || '',
      family.phone      || '',
      family.email      || '',
      family.address    || '',
      family.notes      || '',
      new Date().toISOString()
    ]);
    return { success: true, id };
  } catch(e) { return { success: false, error: String(e) }; }
}

/* ── ADD CHILD TO FAMILY ── */
function addChildAPI(child) {
  try {
    ensureFamilySheets_();
    const ss    = ss_();
    const sheet = ss.getSheetByName(CM_CHILDREN_SHEET);
    const id    = 'C' + Date.now();
    // Get parent name from family
    const fSheet = ss.getSheetByName(FAMILIES_SHEET);
    let parentName = child.parentName || '';
    if (!parentName && child.familyId && fSheet && fSheet.getLastRow() > 1) {
      const rows = fSheet.getRange(2,1,fSheet.getLastRow()-1,2).getValues();
      const fam  = rows.find(r => String(r[0]) === String(child.familyId));
      if (fam) parentName = String(fam[1] || '');
    }
    sheet.appendRow([
      id,
      child.familyId   || '',
      parentName,
      child.firstName  || '',
      child.lastName   || '',
      child.grade      || '',
      child.dob        || '',
      child.allergies  || '',
      child.notes      || '',
      child.room       || '',
      new Date().toISOString()
    ]);
    return { success: true, id, parentName };
  } catch(e) { return { success: false, error: String(e) }; }
}

/* ── EDIT FAMILY ── */
function editFamilyAPI(familyId, updates) {
  try {
    const ss    = ss_();
    const sheet = ss.getSheetByName(FAMILIES_SHEET);
    if (!sheet || sheet.getLastRow() < 2) return { success: false, error: 'No families' };
    const rows = sheet.getRange(2,1,sheet.getLastRow()-1,7).getValues();
    const idx  = rows.findIndex(r => String(r[0]) === String(familyId));
    if (idx === -1) return { success: false, error: 'Family not found' };
    const row = rows[idx];
    if (updates.parentName !== undefined) row[1] = updates.parentName;
    if (updates.phone      !== undefined) row[2] = updates.phone;
    if (updates.email      !== undefined) row[3] = updates.email;
    if (updates.address    !== undefined) row[4] = updates.address;
    if (updates.notes      !== undefined) row[5] = updates.notes;
    sheet.getRange(idx+2, 1, 1, 7).setValues([row]);
    return { success: true };
  } catch(e) { return { success: false, error: String(e) }; }
}

/* ── EDIT CHILD ── */
function editChildAPI(childId, updates) {
  try {
    const ss    = ss_();
    const sheet = ss.getSheetByName(CM_CHILDREN_SHEET);
    if (!sheet || sheet.getLastRow() < 2) return { success: false, error: 'No children' };
    const rows = sheet.getRange(2,1,sheet.getLastRow()-1,11).getValues();
    const idx  = rows.findIndex(r => String(r[0]) === String(childId));
    if (idx === -1) return { success: false, error: 'Child not found' };
    const row = rows[idx];
    if (updates.firstName !== undefined) row[3] = updates.firstName;
    if (updates.lastName  !== undefined) row[4] = updates.lastName;
    if (updates.grade     !== undefined) row[5] = updates.grade;
    if (updates.dob       !== undefined) row[6] = updates.dob;
    if (updates.allergies !== undefined) row[7] = updates.allergies;
    if (updates.notes     !== undefined) row[8] = updates.notes;
    if (updates.room      !== undefined) row[9] = updates.room;
    sheet.getRange(idx+2, 1, 1, 11).setValues([row]);
    return { success: true };
  } catch(e) { return { success: false, error: String(e) }; }
}

/* ── DELETE FAMILY (and children) ── */
function deleteFamilyAPI(familyId) {
  try {
    const ss = ss_();
    // Delete family row
    const fSheet = ss.getSheetByName(FAMILIES_SHEET);
    if (fSheet && fSheet.getLastRow() > 1) {
      const rows = fSheet.getRange(2,1,fSheet.getLastRow()-1,1).getValues();
      for (let i = rows.length-1; i >= 0; i--) {
        if (String(rows[i][0]) === String(familyId)) fSheet.deleteRow(i+2);
      }
    }
    // Delete all children of this family
    const cSheet = ss.getSheetByName(CM_CHILDREN_SHEET);
    if (cSheet && cSheet.getLastRow() > 1) {
      const cRows = cSheet.getRange(2,1,cSheet.getLastRow()-1,2).getValues();
      for (let i = cRows.length-1; i >= 0; i--) {
        if (String(cRows[i][1]) === String(familyId)) cSheet.deleteRow(i+2);
      }
    }
    return { success: true };
  } catch(e) { return { success: false, error: String(e) }; }
}

/* ── DELETE CHILD ── */
function deleteChildAPI(childId) {
  try {
    const ss    = ss_();
    const sheet = ss.getSheetByName(CM_CHILDREN_SHEET);
    if (!sheet || sheet.getLastRow() < 2) return { success: false };
    const rows = sheet.getRange(2,1,sheet.getLastRow()-1,1).getValues();
    for (let i = rows.length-1; i >= 0; i--) {
      if (String(rows[i][0]) === String(childId)) { sheet.deleteRow(i+2); break; }
    }
    return { success: true };
  } catch(e) { return { success: false, error: String(e) }; }
}

/* ── CHECK IN FAMILY (all children) ── */
function checkInFamilyAPI(familyId, meta) {
  try {
    const { families } = getFamiliesAPI();
    const family = families.find(f => f.id === String(familyId));
    if (!family) return { success: false, error: 'Family not found' };
    const results = family.children.map(child =>
      writeCheckIn({
        id:       child.id,
        firstName: child.firstName,
        lastName:  child.lastName,
        fullName:  child.name,
        grade:     child.grade,
        type:      'child',
        familyId:  familyId,
        parentName: family.parentName
      }, { ...meta, event: meta?.event || "Children's Ministry" })
    );
    return { success: true, results };
  } catch(e) { return { success: false, error: String(e) }; }
}

/* ── REGISTER IN doPost WHITELIST ── */
// (make sure these are added to the allowed list in doPost)

/* ═══════════════════════════════════════════════════════════
   VOLUNTEER MANAGEMENT
   Sheets: Volunteers, Departments, VolunteerCheckIns
═══════════════════════════════════════════════════════════ */

const VOL_SHEET   = 'Volunteers';
const DEPT_SHEET  = 'Departments';
const VCHK_SHEET  = 'VolunteerCheckIns';

function ensureVolSheets_() {
  const ss = ss_();
  if (!ss.getSheetByName(VOL_SHEET)) {
    const sh = ss.insertSheet(VOL_SHEET);
    sh.appendRow(['VolID','FirstName','LastName','Phone','Email','Department','Role','Notes','Active','CreatedAt']);
    sh.setFrozenRows(1);
  }
  if (!ss.getSheetByName(DEPT_SHEET)) {
    const sh = ss.insertSheet(DEPT_SHEET);
    sh.appendRow(['DeptID','Name','Icon','Color','CreatedAt']);
    sh.setFrozenRows(1);
    // Seed defaults
    const defaults = [
      ['D1','Worship Team','🎵','#ec4899'],
      ['D2','Ushers & Greeters','🤝','#0891b2'],
      ['D3','Security','🛡️','#dc2626'],
      ['D4','Media & Tech','📽️','#7c3aed'],
      ['D5','Parking & Traffic','🚗','#d97706'],
      ['D6','Prayer Team','🙌','#10b981'],
      ['D7','Hospitality','☕','#78716c'],
      ['D8','Children\'s Ministry','🧒','#10b981'],
      ['D9','Youth Ministry','⚡','#06b6d4'],
    ];
    defaults.forEach(d => sh.appendRow([...d, new Date().toISOString()]));
  }
  if (!ss.getSheetByName(VCHK_SHEET)) {
    const sh = ss.insertSheet(VCHK_SHEET);
    sh.appendRow(['CheckInID','VolID','VolName','Department','Role','Event','CheckInTime','LeaderName']);
    sh.setFrozenRows(1);
  }
}

/* ── GET DEPARTMENTS ── */
function getDepartmentsAPI() {
  try {
    ensureVolSheets_();
    const ss = ss_();
    const sh = ss.getSheetByName(DEPT_SHEET);
    if (!sh || sh.getLastRow() < 2) return { departments: [] };
    const rows = sh.getRange(2,1,sh.getLastRow()-1,5).getValues();
    return { departments: rows.filter(r=>r[0]).map(r=>({
      id:String(r[0]), name:String(r[1]), icon:String(r[2]||'🏷️'), color:String(r[3]||'#6b7280')
    }))};
  } catch(e) { return { departments:[], error:String(e) }; }
}

/* ── ADD DEPARTMENT ── */
function addDepartmentAPI(name, icon, color) {
  try {
    ensureVolSheets_();
    const ss = ss_();
    const sh = ss.getSheetByName(DEPT_SHEET);
    const id = 'D' + Date.now();
    sh.appendRow([id, name||'New Department', icon||'🏷️', color||'#6b7280', new Date().toISOString()]);
    return { success:true, id };
  } catch(e) { return { success:false, error:String(e) }; }
}

/* ── DELETE DEPARTMENT ── */
function deleteDepartmentAPI(deptId) {
  try {
    const ss = ss_();
    const sh = ss.getSheetByName(DEPT_SHEET);
    if (!sh || sh.getLastRow() < 2) return { success:false };
    const rows = sh.getRange(2,1,sh.getLastRow()-1,1).getValues();
    for (let i = rows.length-1; i >= 0; i--) {
      if (String(rows[i][0]) === String(deptId)) { sh.deleteRow(i+2); break; }
    }
    return { success:true };
  } catch(e) { return { success:false, error:String(e) }; }
}

/* ── GET VOLUNTEERS ── */
function getVolunteersAPI(department) {
  try {
    ensureVolSheets_();
    const ss = ss_();
    const sh = ss.getSheetByName(VOL_SHEET);
    if (!sh || sh.getLastRow() < 2) return { volunteers: [] };
    const rows = sh.getRange(2,1,sh.getLastRow()-1,10).getValues();
    let vols = rows.filter(r=>r[0]).map(r=>({
      id:String(r[0]), firstName:String(r[1]||''), lastName:String(r[2]||''),
      name:(String(r[1]||'')+' '+String(r[2]||'')).trim(),
      phone:String(r[3]||''), email:String(r[4]||''),
      department:String(r[5]||''), role:String(r[6]||''),
      notes:String(r[7]||''), active:r[8]!==false
    }));
    if (department && department !== 'all') {
      vols = vols.filter(v => v.department === department);
    }
    return { volunteers: vols.filter(v=>v.active!==false) };
  } catch(e) { return { volunteers:[], error:String(e) }; }
}

/* ── ADD VOLUNTEER ── */
function addVolunteerAPI(vol) {
  try {
    ensureVolSheets_();
    const ss = ss_();
    const sh = ss.getSheetByName(VOL_SHEET);
    const id = 'V' + Date.now();
    sh.appendRow([id, vol.firstName||'', vol.lastName||'', vol.phone||'',
      vol.email||'', vol.department||'', vol.role||'', vol.notes||'', true,
      new Date().toISOString()]);
    return { success:true, id };
  } catch(e) { return { success:false, error:String(e) }; }
}

/* ── EDIT VOLUNTEER ── */
function editVolunteerAPI(volId, updates) {
  try {
    const ss = ss_();
    const sh = ss.getSheetByName(VOL_SHEET);
    if (!sh || sh.getLastRow() < 2) return { success:false };
    const rows = sh.getRange(2,1,sh.getLastRow()-1,10).getValues();
    const idx = rows.findIndex(r=>String(r[0])===String(volId));
    if (idx === -1) return { success:false, error:'Volunteer not found' };
    const row = rows[idx];
    if (updates.firstName  !== undefined) row[1] = updates.firstName;
    if (updates.lastName   !== undefined) row[2] = updates.lastName;
    if (updates.phone      !== undefined) row[3] = updates.phone;
    if (updates.email      !== undefined) row[4] = updates.email;
    if (updates.department !== undefined) row[5] = updates.department;
    if (updates.role       !== undefined) row[6] = updates.role;
    if (updates.notes      !== undefined) row[7] = updates.notes;
    if (updates.active     !== undefined) row[8] = updates.active;
    sh.getRange(idx+2,1,1,10).setValues([row]);
    return { success:true };
  } catch(e) { return { success:false, error:String(e) }; }
}

/* ── DELETE VOLUNTEER ── */
function deleteVolunteerAPI(volId) {
  try {
    const ss = ss_();
    const sh = ss.getSheetByName(VOL_SHEET);
    if (!sh || sh.getLastRow() < 2) return { success:false };
    const rows = sh.getRange(2,1,sh.getLastRow()-1,1).getValues();
    for (let i = rows.length-1; i >= 0; i--) {
      if (String(rows[i][0])===String(volId)) { sh.deleteRow(i+2); break; }
    }
    return { success:true };
  } catch(e) { return { success:false, error:String(e) }; }
}

/* ── CHECK IN VOLUNTEER ── */
function checkInVolunteerAPI(volId, meta) {
  try {
    ensureVolSheets_();
    const ss = ss_();
    const volSh = ss.getSheetByName(VOL_SHEET);
    const chkSh = ss.getSheetByName(VCHK_SHEET);
    // Find volunteer
    let volName = '', dept = '', role = '';
    if (volSh && volSh.getLastRow() > 1) {
      const rows = volSh.getRange(2,1,volSh.getLastRow()-1,7).getValues();
      const v = rows.find(r=>String(r[0])===String(volId));
      if (v) { volName=(String(v[1]||'')+' '+String(v[2]||'')).trim(); dept=String(v[5]||''); role=String(v[6]||''); }
    }
    const id = 'VC' + Date.now();
    chkSh.appendRow([id, volId, volName, dept, role,
      meta?.event||'', new Date().toISOString(), meta?.leader||'']);
    return { success:true, id, volName, department:dept };
  } catch(e) { return { success:false, error:String(e) }; }
}

/* ── GET TODAY'S VOLUNTEER CHECK-INS ── */
function getVolunteerCheckInsAPI(department) {
  try {
    ensureVolSheets_();
    const ss = ss_();
    const sh = ss.getSheetByName(VCHK_SHEET);
    if (!sh || sh.getLastRow() < 2) return { checkins:[] };
    const today = new Date(); today.setHours(0,0,0,0);
    const rows = sh.getRange(2,1,sh.getLastRow()-1,8).getValues();
    let checkins = rows.filter(r=>{
      if (!r[0]) return false;
      const d = new Date(r[6]); d.setHours(0,0,0,0);
      return d.getTime()===today.getTime();
    }).map(r=>({ id:String(r[0]), volId:String(r[1]), name:String(r[2]),
      department:String(r[3]), role:String(r[4]), event:String(r[5]),
      time:String(r[6]), leader:String(r[7]) }));
    if (department && department !== 'all') {
      checkins = checkins.filter(c=>c.department===department);
    }
    return { checkins };
  } catch(e) { return { checkins:[], error:String(e) }; }
}

/* ── VOLUNTEER DASHBOARD ── */
function getVolunteerDashboardAPI() {
  try {
    const allVols = getVolunteersAPI('all').volunteers || [];
    const todayCI = getVolunteerCheckInsAPI('all').checkins || [];
    // Group by department
    const deptMap = {};
    allVols.forEach(v => {
      const d = v.department || 'Unassigned';
      if (!deptMap[d]) deptMap[d] = { total:0, checkedIn:0 };
      deptMap[d].total++;
    });
    todayCI.forEach(c => {
      const d = c.department || 'Unassigned';
      if (!deptMap[d]) deptMap[d] = { total:0, checkedIn:0 };
      deptMap[d].checkedIn++;
    });
    return {
      totalVolunteers: allVols.length,
      checkedInToday: todayCI.length,
      departments: Object.entries(deptMap).map(([name,v])=>({name,...v})),
      recentCheckins: todayCI.slice(-10).reverse()
    };
  } catch(e) { return { totalVolunteers:0, checkedInToday:0, departments:[], recentCheckins:[] }; }
}

/* ═══════════════════════════════════════════════════════════
   SMALL GROUPS
   Sheets: SmallGroups, SGMembers
═══════════════════════════════════════════════════════════ */

const SG_SHEET  = 'SmallGroups';
const SGM_SHEET = 'SGMembers';

function ensureSGSheets_() {
  const ss = ss_();
  if (!ss.getSheetByName(SG_SHEET)) {
    const sh = ss.insertSheet(SG_SHEET);
    sh.appendRow(['GroupID','Name','Leader','LeaderPhone','Day','Time','Location','Category','Notes','CreatedAt']);
    sh.setFrozenRows(1);
  }
  if (!ss.getSheetByName(SGM_SHEET)) {
    const sh = ss.insertSheet(SGM_SHEET);
    sh.appendRow(['MemberID','GroupID','GroupName','FirstName','LastName','Phone','Email','Role','JoinedAt']);
    sh.setFrozenRows(1);
  }
}

function getSmallGroupsAPI() {
  try {
    ensureSGSheets_();
    const ss = ss_();
    const gSh = ss.getSheetByName(SG_SHEET);
    const mSh = ss.getSheetByName(SGM_SHEET);
    if (!gSh || gSh.getLastRow() < 2) return { groups: [] };
    const gRows = gSh.getRange(2,1,gSh.getLastRow()-1,10).getValues();
    const groups = gRows.filter(r=>r[0]).map(r=>({
      id:String(r[0]), name:String(r[1]||''), leader:String(r[2]||''),
      leaderPhone:String(r[3]||''), day:String(r[4]||''), time:String(r[5]||''),
      location:String(r[6]||''), category:String(r[7]||''), notes:String(r[8]||''),
      members:[]
    }));
    if (mSh && mSh.getLastRow() > 1) {
      const mRows = mSh.getRange(2,1,mSh.getLastRow()-1,9).getValues();
      mRows.filter(r=>r[0]).forEach(r=>{
        const g = groups.find(g=>g.id===String(r[1]));
        if (g) g.members.push({ id:String(r[0]), groupId:String(r[1]),
          firstName:String(r[3]||''), lastName:String(r[4]||''),
          name:(String(r[3]||'')+' '+String(r[4]||'')).trim(),
          phone:String(r[5]||''), email:String(r[6]||''), role:String(r[7]||'Member') });
      });
    }
    return { groups };
  } catch(e) { return { groups:[], error:String(e) }; }
}

function addSmallGroupAPI(group) {
  try {
    ensureSGSheets_();
    const id = 'SG' + Date.now();
    ss_().getSheetByName(SG_SHEET).appendRow([
      id, group.name||'', group.leader||'', group.leaderPhone||'',
      group.day||'', group.time||'', group.location||'',
      group.category||'', group.notes||'', new Date().toISOString()
    ]);
    return { success:true, id };
  } catch(e) { return { success:false, error:String(e) }; }
}

function editSmallGroupAPI(groupId, updates) {
  try {
    const sh = ss_().getSheetByName(SG_SHEET);
    if (!sh || sh.getLastRow() < 2) return { success:false };
    const rows = sh.getRange(2,1,sh.getLastRow()-1,10).getValues();
    const idx = rows.findIndex(r=>String(r[0])===String(groupId));
    if (idx===-1) return { success:false, error:'Group not found' };
    const row = rows[idx];
    const fields = ['','name','leader','leaderPhone','day','time','location','category','notes'];
    fields.forEach((f,i)=>{ if(f && updates[f]!==undefined) row[i]=updates[f]; });
    sh.getRange(idx+2,1,1,10).setValues([row]);
    return { success:true };
  } catch(e) { return { success:false, error:String(e) }; }
}

function deleteSmallGroupAPI(groupId) {
  try {
    const ss = ss_();
    const gSh = ss.getSheetByName(SG_SHEET);
    const mSh = ss.getSheetByName(SGM_SHEET);
    if (gSh && gSh.getLastRow() > 1) {
      const rows = gSh.getRange(2,1,gSh.getLastRow()-1,1).getValues();
      for (let i=rows.length-1;i>=0;i--) if(String(rows[i][0])===String(groupId)) gSh.deleteRow(i+2);
    }
    if (mSh && mSh.getLastRow() > 1) {
      const rows = mSh.getRange(2,1,mSh.getLastRow()-1,2).getValues();
      for (let i=rows.length-1;i>=0;i--) if(String(rows[i][1])===String(groupId)) mSh.deleteRow(i+2);
    }
    return { success:true };
  } catch(e) { return { success:false, error:String(e) }; }
}

function addSGMemberAPI(member) {
  try {
    ensureSGSheets_();
    const id = 'SGM' + Date.now();
    ss_().getSheetByName(SGM_SHEET).appendRow([
      id, member.groupId||'', member.groupName||'',
      member.firstName||'', member.lastName||'',
      member.phone||'', member.email||'',
      member.role||'Member', new Date().toISOString()
    ]);
    return { success:true, id };
  } catch(e) { return { success:false, error:String(e) }; }
}

function editSGMemberAPI(memberId, updates) {
  try {
    const sh = ss_().getSheetByName(SGM_SHEET);
    if (!sh || sh.getLastRow() < 2) return { success:false };
    const rows = sh.getRange(2,1,sh.getLastRow()-1,9).getValues();
    const idx = rows.findIndex(r=>String(r[0])===String(memberId));
    if (idx===-1) return { success:false };
    const row = rows[idx];
    if (updates.firstName!==undefined) row[3]=updates.firstName;
    if (updates.lastName !==undefined) row[4]=updates.lastName;
    if (updates.phone    !==undefined) row[5]=updates.phone;
    if (updates.email    !==undefined) row[6]=updates.email;
    if (updates.role     !==undefined) row[7]=updates.role;
    sh.getRange(idx+2,1,1,9).setValues([row]);
    return { success:true };
  } catch(e) { return { success:false, error:String(e) }; }
}

function deleteSGMemberAPI(memberId) {
  try {
    const sh = ss_().getSheetByName(SGM_SHEET);
    if (!sh || sh.getLastRow() < 2) return { success:false };
    const rows = sh.getRange(2,1,sh.getLastRow()-1,1).getValues();
    for (let i=rows.length-1;i>=0;i--) if(String(rows[i][0])===String(memberId)) sh.deleteRow(i+2);
    return { success:true };
  } catch(e) { return { success:false, error:String(e) }; }
}

function checkInSGGroupAPI(groupId, meta) {
  try {
    const { groups } = getSmallGroupsAPI();
    const group = groups.find(g=>g.id===String(groupId));
    if (!group) return { success:false, error:'Group not found' };
    const results = group.members.map(m =>
      writeCheckIn({ id:m.id, firstName:m.firstName, lastName:m.lastName,
        fullName:m.name, type:'small-group', groupId, groupName:group.name, role:m.role },
        { ...meta, event:meta?.event||'Small Groups' })
    );
    return { success:true, count:results.length };
  } catch(e) { return { success:false, error:String(e) }; }
}

/* ═══════════════════════════════════════════════════════════
   SMALL GROUPS MANAGEMENT
   Sheets: SmallGroups, SGMembers, SGCheckIns
═══════════════════════════════════════════════════════════ */

const SG_SHEET  = 'SmallGroups';
const SGM_SHEET = 'SGMembers';
const SGC_SHEET = 'SGCheckIns';

function ensureSGSheets_() {
  const ss = ss_();
  if (!ss.getSheetByName(SG_SHEET)) {
    const sh = ss.insertSheet(SG_SHEET);
    sh.appendRow(['GroupID','Name','LeaderName','LeaderPhone','Day','Time','Location','Category','Notes','CreatedAt']);
    sh.setFrozenRows(1);
  }
  if (!ss.getSheetByName(SGM_SHEET)) {
    const sh = ss.insertSheet(SGM_SHEET);
    sh.appendRow(['MemberID','GroupID','FirstName','LastName','Phone','Email','Role','JoinedAt']);
    sh.setFrozenRows(1);
  }
  if (!ss.getSheetByName(SGC_SHEET)) {
    const sh = ss.insertSheet(SGC_SHEET);
    sh.appendRow(['CheckInID','GroupID','MemberID','MemberName','GroupName','Role','Event','CheckInTime','LeaderName']);
    sh.setFrozenRows(1);
  }
}

function getSmallGroupsAPI() {
  try {
    ensureSGSheets_();
    const ss = ss_();
    const gSh = ss.getSheetByName(SG_SHEET);
    const mSh = ss.getSheetByName(SGM_SHEET);
    const cSh = ss.getSheetByName(SGC_SHEET);

    const groups = gSh && gSh.getLastRow() > 1
      ? gSh.getRange(2,1,gSh.getLastRow()-1,10).getValues().filter(r=>r[0]).map(r=>({
          id:String(r[0]), name:String(r[1]||''), leaderName:String(r[2]||''),
          leaderPhone:String(r[3]||''), day:String(r[4]||''), time:String(r[5]||''),
          location:String(r[6]||''), category:String(r[7]||''), notes:String(r[8]||''),
          members:[]
        })) : [];

    const members = mSh && mSh.getLastRow() > 1
      ? mSh.getRange(2,1,mSh.getLastRow()-1,8).getValues().filter(r=>r[0]).map(r=>({
          id:String(r[0]), groupId:String(r[1]), firstName:String(r[2]||''),
          lastName:String(r[3]||''), name:(String(r[2]||'')+' '+String(r[3]||'')).trim(),
          phone:String(r[4]||''), email:String(r[5]||''), role:String(r[6]||'Member')
        })) : [];

    // Get today's check-ins
    const today = new Date(); today.setHours(0,0,0,0);
    const checkins = new Set(cSh && cSh.getLastRow() > 1
      ? cSh.getRange(2,1,cSh.getLastRow()-1,9).getValues().filter(r=>{
          if(!r[0]) return false;
          const d=new Date(r[7]); d.setHours(0,0,0,0);
          return d.getTime()===today.getTime();
        }).map(r=>String(r[2])) : []);

    // Attach members to groups
    groups.forEach(g => {
      g.members = members.filter(m => m.groupId === g.id);
      g.checkedInCount = g.members.filter(m => checkins.has(m.id)).length;
    });

    return { groups, checkedInIds: [...checkins] };
  } catch(e) { return { groups:[], checkedInIds:[], error:String(e) }; }
}

function addSmallGroupAPI(data) {
  try {
    ensureSGSheets_();
    const id = 'SG' + Date.now();
    ss_().getSheetByName(SG_SHEET).appendRow([
      id, data.name||'', data.leaderName||'', data.leaderPhone||'',
      data.day||'', data.time||'', data.location||'', data.category||'',
      data.notes||'', new Date().toISOString()
    ]);
    return { success:true, id };
  } catch(e) { return { success:false, error:String(e) }; }
}

function editSmallGroupAPI(groupId, data) {
  try {
    const sh = ss_().getSheetByName(SG_SHEET);
    if(!sh||sh.getLastRow()<2) return {success:false};
    const rows = sh.getRange(2,1,sh.getLastRow()-1,10).getValues();
    const idx = rows.findIndex(r=>String(r[0])===String(groupId));
    if(idx===-1) return {success:false,error:'Not found'};
    const r = rows[idx];
    if(data.name!==undefined) r[1]=data.name;
    if(data.leaderName!==undefined) r[2]=data.leaderName;
    if(data.leaderPhone!==undefined) r[3]=data.leaderPhone;
    if(data.day!==undefined) r[4]=data.day;
    if(data.time!==undefined) r[5]=data.time;
    if(data.location!==undefined) r[6]=data.location;
    if(data.category!==undefined) r[7]=data.category;
    if(data.notes!==undefined) r[8]=data.notes;
    sh.getRange(idx+2,1,1,10).setValues([r]);
    return {success:true};
  } catch(e) { return {success:false,error:String(e)}; }
}

function deleteSmallGroupAPI(groupId) {
  try {
    const ss = ss_();
    // Delete group
    const gSh = ss.getSheetByName(SG_SHEET);
    if(gSh&&gSh.getLastRow()>1){
      const rows=gSh.getRange(2,1,gSh.getLastRow()-1,1).getValues();
      for(let i=rows.length-1;i>=0;i--){if(String(rows[i][0])===String(groupId)){gSh.deleteRow(i+2);break;}}
    }
    // Delete all members of group
    const mSh = ss.getSheetByName(SGM_SHEET);
    if(mSh&&mSh.getLastRow()>1){
      const rows=mSh.getRange(2,1,mSh.getLastRow()-1,2).getValues();
      for(let i=rows.length-1;i>=0;i--){if(String(rows[i][1])===String(groupId)){mSh.deleteRow(i+2);}}
    }
    return {success:true};
  } catch(e) { return {success:false,error:String(e)}; }
}

function addSGMemberAPI(data) {
  try {
    ensureSGSheets_();
    const id = 'SGM' + Date.now();
    ss_().getSheetByName(SGM_SHEET).appendRow([
      id, data.groupId||'', data.firstName||'', data.lastName||'',
      data.phone||'', data.email||'', data.role||'Member', new Date().toISOString()
    ]);
    return {success:true, id};
  } catch(e) { return {success:false,error:String(e)}; }
}

function editSGMemberAPI(memberId, data) {
  try {
    const sh = ss_().getSheetByName(SGM_SHEET);
    if(!sh||sh.getLastRow()<2) return {success:false};
    const rows = sh.getRange(2,1,sh.getLastRow()-1,8).getValues();
    const idx = rows.findIndex(r=>String(r[0])===String(memberId));
    if(idx===-1) return {success:false,error:'Not found'};
    const r = rows[idx];
    if(data.firstName!==undefined) r[2]=data.firstName;
    if(data.lastName!==undefined) r[3]=data.lastName;
    if(data.phone!==undefined) r[4]=data.phone;
    if(data.email!==undefined) r[5]=data.email;
    if(data.role!==undefined) r[6]=data.role;
    sh.getRange(idx+2,1,1,8).setValues([r]);
    return {success:true};
  } catch(e) { return {success:false,error:String(e)}; }
}

function deleteSGMemberAPI(memberId) {
  try {
    const sh = ss_().getSheetByName(SGM_SHEET);
    if(!sh||sh.getLastRow()<2) return {success:false};
    const rows = sh.getRange(2,1,sh.getLastRow()-1,1).getValues();
    for(let i=rows.length-1;i>=0;i--){if(String(rows[i][0])===String(memberId)){sh.deleteRow(i+2);break;}}
    return {success:true};
  } catch(e) { return {success:false,error:String(e)}; }
}

function checkInSGGroupAPI(groupId, memberIds, meta) {
  try {
    ensureSGSheets_();
    const ss = ss_();
    const cSh = ss.getSheetByName(SGC_SHEET);
    const gSh = ss.getSheetByName(SG_SHEET);
    const mSh = ss.getSheetByName(SGM_SHEET);

    const gRows = gSh&&gSh.getLastRow()>1?gSh.getRange(2,1,gSh.getLastRow()-1,3).getValues():[];
    const group = gRows.find(r=>String(r[0])===String(groupId));
    const groupName = group?String(group[1]):'';

    const mRows = mSh&&mSh.getLastRow()>1?mSh.getRange(2,1,mSh.getLastRow()-1,8).getValues():[];
    let checkedIn = 0;
    const now = new Date().toISOString();
    for(const mid of memberIds){
      const m = mRows.find(r=>String(r[0])===String(mid));
      if(!m) continue;
      const name=(String(m[2]||'')+' '+String(m[3]||'')).trim();
      cSh.appendRow(['SGC'+Date.now()+'_'+checkedIn, groupId, mid, name, groupName,
        String(m[6]||'Member'), meta?.event||'Small Groups', now, meta?.leader||'']);
      checkedIn++;
    }
    return {success:true, checkedIn};
  } catch(e) { return {success:false,error:String(e)}; }
}
