/**
 * Spaces contact form receiver (Google Apps Script, attached to a private Google Sheet in the Spaces account).
 *
 * Safety rules built in:
 * - It can only ADD a row. There is no code here that reads rows back or returns any sheet data.
 * - The Sheet stays private to Spaces. The website never sees it.
 * - Spam: hidden trap field, size limits, email check, and a cap on how many messages it accepts
 *   per hour overall and per email address.
 * - Everything typed is cleaned, and anything that could act as a spreadsheet formula is made plain text.
 * - Alert email addresses are kept in Script Properties (Project Settings), not in this code,
 *   so they never appear in the public website files.
 */

const SHEET = 'Messages';
const HEADERS = ['Received', 'Form', 'Name', 'Email', 'Phone', 'Project type', 'Message', 'Status'];
const LIMITS = { perHour: 30, perEmailMinutes: 2 };

// No reading allowed: a visit to the address only says it is working.
function doGet() {
  return out_({ ok: true });
}

function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (d.website) return out_({ ok: true });                       // spam trap filled in: pretend it worked
    const row = {
      form: pick_(d.form, ['contact', 'university']) || 'contact',
      name: clean_(d.name, 100),
      email: clean_(d.email, 150).toLowerCase(),
      phone: clean_(d.phone, 30).replace(/[^0-9+()\-. ]/g, ''),
      kind: clean_(d.kind, 40),
      message: clean_(d.message, 2000),
    };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(row.email)) return out_({ ok: false, error: 'email' });
    if (row.form === 'contact' && !row.name) return out_({ ok: false, error: 'name' });

    const cache = CacheService.getScriptCache();
    const hourKey = 'n' + Utilities.formatDate(new Date(), 'UTC', 'yyyyMMddHH');
    const count = +(cache.get(hourKey) || 0);
    if (count >= LIMITS.perHour) return out_({ ok: false, error: 'busy' });
    const emailKey = 'e' + Utilities.base64EncodeWebSafe(row.email).slice(0, 200);
    if (cache.get(emailKey)) return out_({ ok: false, error: 'wait' });

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheet_().appendRow([new Date(), row.form, safe_(row.name), safe_(row.email), safe_(row.phone), safe_(row.kind), safe_(row.message), 'New']);
    } finally { lock.releaseLock(); }
    cache.put(hourKey, String(count + 1), 3600);
    cache.put(emailKey, '1', LIMITS.perEmailMinutes * 60);

    alert_(row);
    return out_({ ok: true });
  } catch (err) {
    console.error(err);
    return out_({ ok: false, error: 'server' });
  }
}

/* ---------- helpers ---------- */

function sheet_() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) { sh = ss.insertSheet(SHEET); sh.appendRow(HEADERS); sh.setFrozenRows(1); }
  return sh;
}

// Remove invisible control characters and angle brackets, squeeze spaces, cap the length.
function clean_(v, max) {
  return String(v || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/[<>]/g, '').replace(/[ \t]+/g, ' ').trim().slice(0, max);
}

// Text that starts with = + - @ could run as a spreadsheet formula. A leading ' keeps it as plain text.
function safe_(v) {
  return /^[=+\-@\t\r]/.test(v) ? "'" + v : v;
}

function pick_(v, allowed) {
  return allowed.indexOf(String(v)) >= 0 ? String(v) : '';
}

// Emails the people listed in Script Properties > ALERT_EMAILS (comma separated). Reply goes to the visitor.
function alert_(row) {
  const to = PropertiesService.getScriptProperties().getProperty('ALERT_EMAILS');
  if (!to) return;
  const subject = row.form === 'university' ? 'Spaces University sign-up' : 'New website inquiry: ' + (row.kind || 'project') + ', ' + row.name;
  const body = [
    'Name: ' + row.name, 'Email: ' + row.email, 'Phone: ' + (row.phone || '(none)'), 'Project: ' + (row.kind || '(none)'), '',
    row.message || '(no message)', '', 'Saved in the Spaces Website Messages sheet.',
  ].join('\n');
  MailApp.sendEmail({ to, subject, body, replyTo: row.email, name: 'Spaces website' });
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
