/* ---------- Legal & Privacy notice ---------- */

var LEGAL_KEY = 'glice_legal_accepted';

var LEGAL_FULL_TEXT_HTML =
  '<h3>1. What this app is</h3>' +
  '<p>The Glice Operator App is a maintenance aid for staff running daily checks on a Glice synthetic ice rink. It is provided by Glice AG, Hirschengraben 33b, 6003 Lucerne, Switzerland, as a free tool to support rink operations. It is not a substitute for the official installation, cleaning, and maintenance manuals, or for training provided by Glice or your facility.</p>' +
  '<h3>2. Data we store, and where</h3>' +
  '<p>The app stores the following data locally on the device it runs on, using browser storage (localStorage and IndexedDB). None of it is sent to Glice’s servers:</p>' +
  '<ul>' +
  '<li>Rink profile (type, drainage, cover, rental setup)</li>' +
  '<li>Daily checklist answers and history, with the date, time, and staff name entered for each entry</li>' +
  '<li>Photos attached to checklist entries</li>' +
  '</ul>' +
  '<p>Photos are automatically deleted from the device after 30 days. All other local data remains until the facility clears it (e.g., by clearing browser data or uninstalling the app).</p>' +
  '<p>The app also keeps an offline copy of its own files (code, images and typefaces) in the browser cache so that it can open without a connection. This copy contains no personal data. Small app preferences (for example, whether the install tip was dismissed) are stored on the device in the same way.</p>' +
  '<h3>3. When data leaves the device</h3>' +
  '<p>Data only leaves the device if a staff member actively chooses to export or share it — for example, generating a PDF summary and emailing or messaging it to a supervisor or to Glice support. That export, and anyone it is sent to, is outside this app’s control.</p>' +
  '<h3>4. Photos</h3>' +
  '<p>Photos are taken to document rink conditions. Staff should avoid capturing identifiable people (colleagues, visitors, bystanders) where reasonably possible. The facility is responsible for how photos are used, stored, and deleted beyond the automatic 30-day local cleanup.</p>' +
  '<h3>5. Staff / employee data</h3>' +
  '<p>Entering a staff name against a checklist entry creates a record of who performed a task and when. This data stays on the device and is not used by Glice for employee monitoring or evaluation. However, your facility, as the employer, is responsible for informing staff about this record-keeping and for complying with applicable local labor and data protection law, which can require more than a notice (for example, prior consultation with employee representatives) depending on the country.</p>' +
  '<h3>6. Third-party services</h3>' +
  '<p>The Video Library streams instructional videos hosted on Vimeo. Playing a video connects to Vimeo and is subject to Vimeo’s own privacy practices, outside Glice’s control.</p>' +
  '<p>The app is served from GitHub Pages (GitHub, Inc., a Microsoft company) and loads its typeface from Google Fonts. When the app is opened with an internet connection, these providers receive standard connection data, such as the device’s IP address, and are subject to their own privacy practices, outside Glice’s control. Once the app has been opened online, it can start again without a connection.</p>' +
  '<h3>7. No warranty; limitation of liability</h3>' +
  '<p>This app is provided “as is” and “as available,” without warranties of any kind, express or implied, including fitness for a particular purpose or error-free operation. To the fullest extent permitted by law, Glice AG is not liable for any damages, direct or indirect, arising from use of this app, including reliance on checklist results or loss of locally stored data.</p>' +
  '<h3>8. Governing law</h3>' +
  '<p>This notice is governed by Swiss law, consistent with Glice AG’s general Terms &amp; Conditions, without prejudice to any mandatory local consumer, data protection, or labor law that applies to your facility.</p>' +
  '<h3>9. Contact</h3>' +
  '<p>Questions about this app: helpdesk@glice.com. Questions about Glice’s general data practices: privacy@glicerink.com.</p>';

function hasAcceptedLegalNotice() {
  try {
    return !!JSON.parse(localStorage.getItem(LEGAL_KEY)).accepted;
  } catch (e) {
    return false;
  }
}

(function initLegalNotice() {
  ['legalFullTextOverlay', 'legalFullTextScreen'].forEach(function (id) {
    var target = document.getElementById(id);
    if (target) target.innerHTML = LEGAL_FULL_TEXT_HTML;
  });

  var overlay = document.getElementById('legalOverlay');
  var acceptBtn = document.getElementById('legalAcceptBtn');
  if (!overlay || !acceptBtn) return;

  overlay.hidden = hasAcceptedLegalNotice();

  acceptBtn.addEventListener('click', function () {
    localStorage.setItem(LEGAL_KEY, JSON.stringify({ accepted: true, at: new Date().toISOString() }));
    overlay.hidden = true;
  });
})();

/* Screen navigation is kept in sync with the browser history, so the Android back
   button (and the iOS swipe-back) moves to the previous screen instead of leaving the app. */

var screenStack = ['home'];
if (window.history && history.replaceState) {
  history.replaceState({ screen: 'home', i: 0 }, '');
}

function renderScreen(id) {
  document.querySelectorAll('.screen').forEach(function (el) {
    el.hidden = true;
  });
  var target = document.getElementById('screen-' + id);
  if (target) {
    target.hidden = false;
  }
}

// opts.replace: swap the current history entry instead of adding one.
// opts.fromPop: the browser already moved in history; only draw the screen.
function showScreen(id, opts) {
  opts = opts || {};
  var current = screenStack[screenStack.length - 1];
  renderScreen(id);
  if (opts.fromPop || !(window.history && history.pushState)) return;

  if (opts.replace || id === current) {
    screenStack[screenStack.length - 1] = id;
    history.replaceState({ screen: id, i: screenStack.length - 1 }, '');
  } else {
    screenStack.push(id);
    history.pushState({ screen: id, i: screenStack.length - 1 }, '');
  }
}

// Go "back" to a parent screen: rewind history to it if it is already in the stack.
function navigateTo(target) {
  var idx = screenStack.lastIndexOf(target);
  var top = screenStack.length - 1;
  if (idx !== -1 && idx < top && window.history && history.go) {
    history.go(idx - top); // the popstate handler below draws the screen
  } else {
    showScreen(target, { replace: true });
  }
}

window.addEventListener('popstate', function (e) {
  var st = e.state;
  if (!st || typeof st.i !== 'number' || !st.screen) return;
  if (st.i < screenStack.length) screenStack.length = st.i + 1;
  screenStack[st.i] = st.screen;
  showScreen(st.screen, { fromPop: true });
  if (st.screen === 'home') renderHomeContext();
  if (st.screen === 'maintenance') renderMaintenanceScreen();
});

document.querySelectorAll('[data-screen]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    showScreen(btn.getAttribute('data-screen'));
  });
});

document.querySelectorAll('[data-back]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var target = btn.getAttribute('data-back');
    navigateTo(target || 'home');
  });
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('service-worker.js').catch(function () {
      // Registration is optional at this stage; offline support comes later.
    });
  });
}

/* ---------- Rink Profile ---------- */

var PROFILE_KEY = 'glice_rink_profile';

function getProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

// A profile is complete when the four yes/no or indoor/outdoor questions are answered.
// Rink size is optional (it is only shown in the Home summary).
var PROFILE_REQUIRED_FIELDS = ['location', 'hasDrainage', 'hasCover', 'offersSkateRental'];

function isProfileComplete() {
  var p = getProfile();
  return PROFILE_REQUIRED_FIELDS.every(function (f) { return !!p[f]; });
}

(function initRinkProfileForm() {
  var form = document.getElementById('rink-profile-form');
  if (!form) return;

  var profile = getProfile();

  // Restore rink size
  var sizeInput = document.getElementById('rinkSize');
  if (profile.rinkSize) sizeInput.value = profile.rinkSize;

  // Wire up toggle groups
  form.querySelectorAll('.toggle-group').forEach(function (group) {
    var field = group.getAttribute('data-field');
    var buttons = group.querySelectorAll('button');

    buttons.forEach(function (btn) {
      if (profile[field] === btn.getAttribute('data-value')) {
        btn.classList.add('is-active');
      }
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        profile[field] = btn.getAttribute('data-value');
      });
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var wasComplete = isProfileComplete();
    profile.rinkSize = sizeInput.value;
    saveProfile(profile);

    var msg = document.getElementById('profile-saved-msg');
    var errMsg = document.getElementById('profile-error-msg');

    if (!isProfileComplete()) {
      // Keep what was entered, but explain why the checklist is still locked.
      msg.hidden = true;
      errMsg.hidden = false;
      return;
    }
    errMsg.hidden = true;
    msg.hidden = false;

    if (!wasComplete) {
      // First time the profile is completed: continue to Home.
      setTimeout(function () {
        msg.hidden = true;
        navigateTo('home');
        renderHomeContext();
      }, 800);
    } else {
      setTimeout(function () { msg.hidden = true; }, 2000);
    }
  });
})();

/* ---------- First-run onboarding ---------- */
// First launch with an incomplete profile: open the Rink Profile once.
// Only the checklist is gated on a complete profile; Videos and Support stay usable.

var ONBOARDING_KEY = 'glice_onboarding_shown';

(function initFirstRun() {
  if (isProfileComplete() || localStorage.getItem(ONBOARDING_KEY)) return;
  localStorage.setItem(ONBOARDING_KEY, '1');
  var subtitle = document.getElementById('profileSubtitle');
  if (subtitle) subtitle.textContent = 'Welcome! Answer these questions to unlock your daily checklist. It only takes a minute.';
  showScreen('rink-profile', { replace: true });
})();

/* ---------- Daily Maintenance (data-driven from data/checklist.json) ---------- */

var checklistData = null;
var checklistLoadError = null;

try {
  var checklistTag = document.getElementById('checklistData');
  checklistData = JSON.parse(checklistTag.textContent);
} catch (err) {
  checklistLoadError = err;
}
renderMaintenanceScreen();

/* ---------- Local task history (IndexedDB) ---------- */

var DB_NAME = 'glice_operator_db';
var DB_VERSION = 1;
var STORE_NAME = 'taskLog';
var dbPromise = null;

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise(function (resolve, reject) {
    var req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = function (e) {
      var db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        var store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('by_task_date', ['taskId', 'date']);
      }
    };
    req.onsuccess = function (e) { resolve(e.target.result); };
    req.onerror = function (e) { reject(e.target.error); };
  });
  return dbPromise;
}

function todayStr() {
  var d = new Date();
  var mm = String(d.getMonth() + 1).padStart(2, '0');
  var dd = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + mm + '-' + dd;
}

/* ---------- Automatic photo cleanup ---------- */
// Photos are the only heavy part of the local history — the text record
// (task, staff name, date, time) stays forever. After PHOTO_RETENTION_DAYS,
// we strip just the photo from old records to free up device storage,
// without losing the audit trail itself.

var PHOTO_RETENTION_DAYS = 30;

function cleanupOldPhotos() {
  var cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - PHOTO_RETENTION_DAYS);

  openDb().then(function (db) {
    var tx = db.transaction(STORE_NAME, 'readwrite');
    var store = tx.objectStore(STORE_NAME);
    var removed = 0;

    store.openCursor().onsuccess = function (e) {
      var cursor = e.target.result;
      if (!cursor) {
        if (removed > 0) console.log('Cleaned up ' + removed + ' old photo(s) past the ' + PHOTO_RETENTION_DAYS + '-day retention window.');
        return;
      }
      var record = cursor.value;
      if (record.photoBlob && new Date(record.date) < cutoff) {
        delete record.photoBlob;
        cursor.update(record);
        removed++;
      }
      cursor.continue();
    };
  }).catch(function (err) {
    console.error('Photo cleanup failed:', err);
  });
}

// Run once whenever the app loads.
cleanupOldPhotos();

function showToast(message, isError) {
  var toast = document.getElementById('appToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'appToast';
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.padding = '9px 18px';
    toast.style.borderRadius = 'var(--radius-pill)';
    toast.style.fontSize = '13px';
    toast.style.fontFamily = 'var(--font-body)';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.2s ease';
    toast.style.zIndex = '999';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.background = isError ? 'var(--danger)' : 'var(--accent)';
  toast.style.color = isError ? '#FFFFFF' : 'var(--accent-text)';
  toast.style.opacity = '1';
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(function () { toast.style.opacity = '0'; }, 1400);
}

function getStaffName() {
  var input = document.getElementById('staffNameInput');
  return input ? input.value.trim() : '';
}

// One record per task per day — checking/unchecking updates the same record.
function logTaskCompletion(taskId, taskName, completed) {
  var staffName = getStaffName();
  openDb().then(function (db) {
    var tx = db.transaction(STORE_NAME, 'readwrite');
    var store = tx.objectStore(STORE_NAME);
    var index = store.index('by_task_date');
    var getReq = index.get([taskId, todayStr()]);
    getReq.onsuccess = function () {
      var record = getReq.result;
      if (record) {
        record.completed = completed;
        record.staffName = staffName;
        record.timestamp = new Date().toISOString();
        store.put(record);
      } else {
        store.add({
          taskId: taskId,
          taskName: taskName,
          date: todayStr(),
          completed: completed,
          staffName: staffName,
          timestamp: new Date().toISOString()
        });
      }
    };
    tx.oncomplete = function () { showToast(completed ? 'Saved ✓' : 'Updated'); };
    tx.onerror = function () { showToast('Could not save — try again', true); };
  }).catch(function (err) {
    console.error('Could not save to local history:', err);
    showToast('Could not save — try again', true);
  });
}

// Event-based tasks (e.g. rental checks) always add a new record — there's
// no single "today's" row to update, each log is its own occurrence.
function logEventTask(taskId, taskName) {
  var staffName = getStaffName();
  openDb().then(function (db) {
    var tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).add({
      taskId: taskId,
      taskName: taskName,
      date: todayStr(),
      completed: true,
      staffName: staffName,
      timestamp: new Date().toISOString()
    });
    tx.oncomplete = function () { showToast('Saved ✓'); };
    tx.onerror = function () { showToast('Could not save — try again', true); };
  }).catch(function (err) {
    console.error('Could not save to local history:', err);
    showToast('Could not save — try again', true);
  });
}

/* ---------- Task photos (compressed before saving) ---------- */

function compressImage(file, maxWidth, quality) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, maxWidth / img.width);
        var canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(function (blob) {
          if (blob) resolve(blob); else reject(new Error('toBlob failed'));
        }, 'image/jpeg', quality || 0.75);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Photos attach to the same per-task-per-day record used for completion —
// creates the record if the task hasn't been checked yet.
function attachPhotoToTask(taskId, taskName, blob) {
  var staffName = getStaffName();
  openDb().then(function (db) {
    var tx = db.transaction(STORE_NAME, 'readwrite');
    var store = tx.objectStore(STORE_NAME);
    var index = store.index('by_task_date');
    var getReq = index.get([taskId, todayStr()]);
    getReq.onsuccess = function () {
      var record = getReq.result;
      if (record) {
        record.photoBlob = blob;
        if (!record.staffName) record.staffName = staffName;
        store.put(record);
      } else {
        store.add({
          taskId: taskId,
          taskName: taskName,
          date: todayStr(),
          completed: false,
          staffName: staffName,
          timestamp: new Date().toISOString(),
          photoBlob: blob
        });
      }
    };
    tx.oncomplete = function () { showToast('Photo saved ✓'); };
    tx.onerror = function () { showToast('Could not save photo', true); };
  }).catch(function (err) {
    console.error('Could not save photo:', err);
    showToast('Could not save photo', true);
  });
}

var CAMERA_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>';

function findGroup(id) {
  return checklistData.groups.find(function (g) { return g.id === id; });
}

function findQuestion(id) {
  return checklistData.questions.find(function (q) { return q.id === id; });
}

function fieldIsYes(field) {
  return getProfile()[field] === 'yes';
}

function taskVisible(task, answers) {
  var t = task.trigger;
  if (t === 'always' || !t) return true;
  if (t.type === 'conditional') {
    if (t.showWhen) return answers[t.showWhen.question] === t.showWhen.equals;
    if (t.requiresRinkProfileField) return fieldIsYes(t.requiresRinkProfileField);
  }
  if (t.type === 'event') {
    return t.requiresRinkProfileField ? fieldIsYes(t.requiresRinkProfileField) : true;
  }
  return false;
}

function el(tag, className, text) {
  var e = document.createElement(tag);
  if (className) e.className = className;
  if (text) e.textContent = text;
  return e;
}

function makeLabel(text) {
  return el('div', 'task-group-label', text);
}

function makeQuestion(text) {
  return el('p', 'field-question', text);
}

function makeToggle(onChange) {
  var group = el('div', 'toggle-group');
  ['yes', 'no'].forEach(function (val) {
    var btn = el('button', 'btn-secondary', val === 'yes' ? 'Yes' : 'No');
    btn.type = 'button';
    btn.addEventListener('click', function () {
      group.querySelectorAll('button').forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      onChange(val);
    });
    group.appendChild(btn);
  });
  return group;
}

function makePhotoControl(taskId, title) {
  var wrap = el('span');
  wrap.style.display = 'inline-flex';
  wrap.style.alignItems = 'center';
  wrap.style.flexShrink = '0';

  var cameraBtn = el('button');
  cameraBtn.type = 'button';
  cameraBtn.innerHTML = CAMERA_ICON;
  cameraBtn.title = 'Attach photo';
  cameraBtn.style.background = 'none';
  cameraBtn.style.border = 'none';
  cameraBtn.style.cursor = 'pointer';
  cameraBtn.style.color = 'var(--text-secondary)';
  cameraBtn.style.display = 'flex';
  cameraBtn.style.padding = '4px';

  var fileInput = el('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.capture = 'environment';
  fileInput.style.display = 'none';

  fileInput.addEventListener('change', function () {
    var file = fileInput.files[0];
    if (!file) return;
    compressImage(file, 800, 0.75).then(function (blob) {
      attachPhotoToTask(taskId, title, blob);
      cameraBtn.style.color = 'var(--accent)';
    }).catch(function (err) {
      console.error('Could not process photo:', err);
      showToast('Could not process photo', true);
    });
  });

  cameraBtn.addEventListener('click', function () { fileInput.click(); });

  wrap.appendChild(cameraBtn);
  wrap.appendChild(fileInput);
  return wrap;
}

function makeTaskRow(title, note, onChange, danger, taskId) {
  var row = el('div', 'task-row');
  var checkbox = el('input', 'task-checkbox');
  checkbox.type = 'checkbox';
  checkbox.addEventListener('change', function () { onChange(checkbox.checked); });
  var label = el('span', 'task-row__label');
  label.textContent = title;
  if (danger) label.style.color = 'var(--danger)';
  if (note) {
    var noteEl = el('span', 'task-row__note', note);
    label.appendChild(noteEl);
  }
  row.appendChild(checkbox);
  row.appendChild(label);

  if (taskId) {
    row.appendChild(makePhotoControl(taskId, title));
  }

  return row;
}

function renderGroupCard(label, tasks) {
  var wrap = document.createDocumentFragment();
  if (!tasks.length) return wrap;
  wrap.appendChild(makeLabel(label));
  var card = el('div', 'task-card');
  tasks.forEach(function (task) {
    card.appendChild(makeTaskRow(task.name, task.frequency || null, function (checked) {
      logTaskCompletion(task.id, task.name, checked);
    }, false, task.id));
  });
  wrap.appendChild(card);
  return wrap;
}

function renderMaintenanceScreen() {
  var container = document.getElementById('maintenanceContent');
  if (!container) return;
  container.innerHTML = '';

  if (checklistLoadError) {
    var errMsg = el('p', 'screen-subtitle', 'Could not read the checklist data embedded in this page. Please check the checklistData script tag in index.html.');
    errMsg.style.color = 'var(--danger)';
    container.appendChild(errMsg);
    return;
  }
  if (!checklistData) return; // still loading

  // Gate: the checklist depends on the Rink Profile (UV cover, skate rental).
  if (!isProfileComplete()) {
    var gate = el('div', 'task-card');
    gate.appendChild(el('p', 'screen-subtitle', 'Set up your Rink Profile first. Your daily checklist depends on it (for example UV cover and skate rental).'));
    var gateBtn = el('button', 'btn-primary', 'Set up Rink Profile');
    gateBtn.type = 'button';
    gateBtn.addEventListener('click', function () { showScreen('rink-profile'); });
    gate.appendChild(gateBtn);
    container.appendChild(gate);
    return;
  }

  var answers = { q_dirty: null, q_restored: null };
  var completed = {};

  // --- Staff name (remembered on this device between visits) ---
  var nameWrap = el('div');
  var nameLabel = el('label', 'field-label', 'Your name');
  nameLabel.htmlFor = 'staffNameInput';
  var nameInput = el('input', 'field-input');
  nameInput.type = 'text';
  nameInput.id = 'staffNameInput';
  nameInput.placeholder = 'e.g. Ana G.';
  nameInput.value = localStorage.getItem('glice_last_staff_name') || '';
  nameInput.addEventListener('change', function () {
    localStorage.setItem('glice_last_staff_name', nameInput.value.trim());
  });
  var nameNote = el('p', 'field-note', 'Enter your own name. Saved locally with today’s checklist — not sent to Glice.');

  nameWrap.appendChild(nameLabel);
  nameWrap.appendChild(nameInput);
  nameWrap.appendChild(nameNote);
  nameWrap.style.marginBottom = '20px';
  container.appendChild(nameWrap);

  // --- Daily group ---
  var dailyGroup = findGroup('daily');
  var dailyTasks = dailyGroup.tasks.filter(function (t) { return taskVisible(t, answers); });
  container.appendChild(renderGroupCard(dailyGroup.label, dailyTasks));

  // --- Cleaning flow (dirty -> restored -> powerwash) ---
  container.appendChild(makeLabel('Cleaning'));
  var cleaningCard = el('div', 'task-card');
  cleaningCard.style.padding = '14px';
  var qDirty = findQuestion('q_dirty');

  var qDirtyRow = el('div');
  qDirtyRow.style.display = 'flex';
  qDirtyRow.style.alignItems = 'center';
  qDirtyRow.style.justifyContent = 'space-between';
  qDirtyRow.style.gap = '8px';

  var qDirtyText = makeQuestion(qDirty.text);
  qDirtyText.style.marginBottom = '0';
  qDirtyRow.appendChild(qDirtyText);

  // Photo evidence is available for BOTH answers — a "No" needs to be
  // checkable too, since the supervisor isn't necessarily on site to verify.
  var dirtyPhotoWrap = el('span');
  qDirtyRow.appendChild(dirtyPhotoWrap);

  function updateDirtyPhotoControl(val) {
    dirtyPhotoWrap.innerHTML = '';
    var taskId = val === 'yes' ? 'condition_dirty' : 'condition_clean';
    var title = val === 'yes' ? 'Surface condition (dirty)' : 'Surface condition (clean)';
    dirtyPhotoWrap.appendChild(makePhotoControl(taskId, title));
  }

  cleaningCard.appendChild(qDirtyRow);
  cleaningCard.style.marginTop = '0';

  var dirtyBlock = el('div');
  dirtyBlock.hidden = true;
  dirtyBlock.style.marginTop = '10px';

  var dirtyToggle = makeToggle(function (val) {
    answers.q_dirty = (val === 'yes');
    dirtyBlock.hidden = !answers.q_dirty;
    updateDirtyPhotoControl(val);
    renderDirtyBlock();
  });
  cleaningCard.appendChild(dirtyToggle);
  cleaningCard.appendChild(dirtyBlock);
  container.appendChild(cleaningCard);

  function renderDirtyBlock() {
    dirtyBlock.innerHTML = '';
    if (!answers.q_dirty) return;

    var occGroup = findGroup('occasional');
    var o1 = occGroup.tasks.find(function (t) { return t.id === 'o1'; });
    var o2 = occGroup.tasks.find(function (t) { return t.id === 'o2'; });

    var cleanRow = makeTaskRow(o1.name, o2 ? o2.name : null, function (checked) {
      completed.o1 = checked;
      completed.o2 = checked;
      logTaskCompletion(o1.id, o1.name, checked);
      if (o2) logTaskCompletion(o2.id, o2.name, checked);
      renderRestoredBlock();
    }, false, o1.id);
    cleanRow.style.borderTop = '0.5px solid var(--surface-border)';
    cleanRow.style.marginTop = '12px';
    cleanRow.style.paddingTop = '12px';
    dirtyBlock.appendChild(cleanRow);

    var restoredWrap = el('div');
    dirtyBlock.appendChild(restoredWrap);

    function renderRestoredBlock() {
      restoredWrap.innerHTML = '';
      if (!completed.o1) return;

      var qRestored = findQuestion('q_restored');
      restoredWrap.appendChild(makeQuestion(qRestored.text));

      var pwWrap = el('div');
      var restoredToggle = makeToggle(function (val) {
        answers.q_restored = (val === 'yes');
        renderPowerwash();
      });
      restoredWrap.appendChild(restoredToggle);
      restoredWrap.appendChild(pwWrap);

      function renderPowerwash() {
        pwWrap.innerHTML = '';
        if (answers.q_restored !== false) return;
        var pwGroup = findGroup('powerwash');
        var pw1 = pwGroup.tasks.find(function (t) { return t.id === 'pw1'; });
        var pwRow = makeTaskRow(pw1.name, 'Exceptional', function (checked) {
          completed.pw1 = checked;
          logTaskCompletion(pw1.id, pw1.name, checked);
        }, true, pw1.id);
        pwRow.style.borderTop = '0.5px solid var(--surface-border)';
        pwRow.style.marginTop = '12px';
        pwRow.style.paddingTop = '12px';
        pwWrap.appendChild(pwRow);
      }
    }
  }

  // --- Sharpening group (checkbox tasks only — event tasks are handled separately below) ---
  var sharpeningGroup = findGroup('sharpening');
  var sharpeningTasks = sharpeningGroup.tasks.filter(function (t) {
    return t.trigger && t.trigger.type !== 'event' && taskVisible(t, answers);
  });
  container.appendChild(renderGroupCard(sharpeningGroup.label, sharpeningTasks));

  // --- Event-based tasks (e.g. rental skate check) ---
  checklistData.groups.forEach(function (group) {
    group.tasks.filter(function (t) { return t.trigger && t.trigger.type === 'event'; }).forEach(function (task) {
      if (!taskVisible(task, answers)) return;
      container.appendChild(makeLabel('Rental skates'));
      var eventCard = el('div', 'task-card');
      eventCard.style.padding = '14px';
      eventCard.style.display = 'flex';
      eventCard.style.alignItems = 'center';
      eventCard.style.justifyContent = 'space-between';

      var countLabel = el('span', 'task-row__label');
      var count = 0;
      countLabel.textContent = 'Logged today: ' + count;

      var logBtn = el('button', 'btn-secondary', '+ Log check');
      logBtn.type = 'button';
      logBtn.style.flex = 'none';
      logBtn.style.padding = '8px 16px';
      logBtn.title = task.name;
      logBtn.addEventListener('click', function () {
        count += 1;
        countLabel.textContent = 'Logged today: ' + count;
        logEventTask(task.id, task.name);
      });

      eventCard.appendChild(countLabel);
      eventCard.appendChild(logBtn);
      container.appendChild(eventCard);
    });
  });

  // --- Share today's summary without leaving the checklist (same PDF as in History) ---
  var shareBtn = el('button', 'btn-primary', 'Share Daily Summary (PDF)');
  shareBtn.type = 'button';
  shareBtn.id = 'maintenanceExportPdfBtn';
  shareBtn.style.marginTop = '24px';
  shareBtn.addEventListener('click', exportTodaysPdfSummary);
  container.appendChild(shareBtn);
}

// Re-render every time the maintenance screen is opened, so it reflects
// the latest Rink Profile and starts each visit with a clean session state.
document.querySelectorAll('[data-screen="maintenance"]').forEach(function (btn) {
  btn.addEventListener('click', renderMaintenanceScreen);
});

/* ---------- History screen ---------- */

var historyObjectUrls = [];

function renderHistoryScreen() {
  var container = document.getElementById('historyContent');
  if (!container) return;
  container.innerHTML = '<p class="screen-subtitle">Loading…</p>';

  // Revoke previously created photo URLs so we don't leak memory on re-render.
  historyObjectUrls.forEach(function (url) { URL.revokeObjectURL(url); });
  historyObjectUrls = [];

  openDb().then(function (db) {
    var tx = db.transaction(STORE_NAME, 'readonly');
    var store = tx.objectStore(STORE_NAME);
    var records = [];
    store.openCursor(null, 'prev').onsuccess = function (e) {
      var cursor = e.target.result;
      if (cursor && records.length < 200) {
        records.push(cursor.value);
        cursor.continue();
      } else {
        renderHistoryList(records);
      }
    };
  }).catch(function (err) {
    console.error('Could not load history:', err);
    container.innerHTML = '';
    container.appendChild(el('p', 'screen-subtitle', 'Could not load history.'));
  });
}

function renderHistoryList(records) {
  var container = document.getElementById('historyContent');
  container.innerHTML = '';

  if (!records.length) {
    container.appendChild(el('p', 'screen-subtitle', 'No activity recorded yet.'));
    return;
  }

  var groups = {};
  var order = [];
  records.forEach(function (r) {
    if (!groups[r.date]) { groups[r.date] = []; order.push(r.date); }
    groups[r.date].push(r);
  });

  order.forEach(function (date) {
    container.appendChild(makeLabel(date));
    var card = el('div', 'task-card');

    groups[date].forEach(function (r) {
      var row = el('div', 'task-row');

      var icon = el('span', null, r.completed ? '✓' : '—');
      icon.style.color = r.completed ? 'var(--success)' : 'var(--text-secondary)';
      icon.style.width = '18px';
      icon.style.flexShrink = '0';
      icon.style.fontSize = '14px';
      icon.style.textAlign = 'center';
      row.appendChild(icon);

      var label = el('span', 'task-row__label', r.taskName || r.taskId);
      var time = r.timestamp ? new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
      var noteText = (r.staffName ? r.staffName : 'No name') + (time ? ' · ' + time : '');
      label.appendChild(el('span', 'task-row__note', noteText));
      row.appendChild(label);

      if (r.photoBlob) {
        var url = URL.createObjectURL(r.photoBlob);
        historyObjectUrls.push(url);
        var thumb = el('img');
        thumb.src = url;
        thumb.style.width = '36px';
        thumb.style.height = '36px';
        thumb.style.objectFit = 'cover';
        thumb.style.borderRadius = '6px';
        thumb.style.flexShrink = '0';
        row.appendChild(thumb);
      }

      card.appendChild(row);
    });

    container.appendChild(card);
  });
}

document.querySelectorAll('[data-screen="history"]').forEach(function (btn) {
  btn.addEventListener('click', renderHistoryScreen);
});

/* ---------- Export today's summary as PDF ---------- */

function blobToDataUrl(blob) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onload = function () { resolve(reader.result); };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function exportTodaysPdfSummary() {
  openDb().then(function (db) {
    var tx = db.transaction(STORE_NAME, 'readonly');
    var store = tx.objectStore(STORE_NAME);
    var records = [];
    store.openCursor().onsuccess = function (e) {
      var cursor = e.target.result;
      if (cursor) {
        if (cursor.value.date === todayStr()) records.push(cursor.value);
        cursor.continue();
      } else {
        buildAndSharePdf(records);
      }
    };
  }).catch(function (err) {
    console.error('Could not export PDF:', err);
    showToast('Could not export PDF', true);
  });
}

function buildAndSharePdf(records) {
  if (!records.length) {
    showToast('Nothing logged today yet', true);
    return;
  }

  var photoPromises = records.map(function (r) {
    return r.photoBlob ? blobToDataUrl(r.photoBlob) : Promise.resolve(null);
  });

  Promise.all(photoPromises).then(function (photoDataUrls) {
    var jsPDFCtor = window.jspdf.jsPDF;
    var doc = new jsPDFCtor({ unit: 'pt', format: 'a4' });
    var pageWidth = doc.internal.pageSize.getWidth();
    var margin = 40;
    var y = margin;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('GLICE', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Operator App', margin, y + 14);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Daily summary', pageWidth - margin, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth - margin, y + 14, { align: 'right' });

    y += 34;
    doc.setDrawColor(20);
    doc.line(margin, y, pageWidth - margin, y);
    y += 20;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Task', margin, y);
    doc.text('Staff', margin + 260, y);
    doc.text('Time', pageWidth - margin, y, { align: 'right' });
    y += 8;
    doc.setDrawColor(220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 16;

    doc.setTextColor(20);
    doc.setFontSize(10);
    records.forEach(function (r) {
      var time = r.timestamp ? new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
      var mark = r.completed ? '✓' : '✕';
      doc.text(mark + '  ' + (r.taskName || r.taskId), margin, y);
      doc.text(r.staffName || '—', margin + 260, y);
      doc.text(time, pageWidth - margin, y, { align: 'right' });
      y += 18;
    });

    var photosWithData = records
      .map(function (r, i) { return { r: r, url: photoDataUrls[i] }; })
      .filter(function (item) { return item.url; });

    if (photosWithData.length) {
      y += 14;
      doc.setDrawColor(220);
      doc.line(margin, y, pageWidth - margin, y);
      y += 20;
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text('PHOTOS OF THE DAY', margin, y);
      y += 14;

      var thumbSize = 90;
      var gap = 14;
      var perRow = Math.max(1, Math.floor((pageWidth - 2 * margin + gap) / (thumbSize + gap)));
      var col = 0;
      var rowStartY = y;

      photosWithData.forEach(function (item) {
        var x = margin + col * (thumbSize + gap);
        try {
          doc.addImage(item.url, 'JPEG', x, rowStartY, thumbSize, thumbSize);
        } catch (e) {
          console.error('Could not embed photo in PDF:', e);
        }
        doc.setFontSize(7);
        doc.setTextColor(90);
        doc.text((item.r.taskName || '').slice(0, 22), x, rowStartY + thumbSize + 10);

        col++;
        if (col >= perRow) {
          col = 0;
          rowStartY += thumbSize + 24;
        }
      });
    }

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Generated automatically by Glice Operator App · ' + new Date().toLocaleString(), margin, doc.internal.pageSize.getHeight() - 20);

    var pdfBlob = doc.output('blob');
    var fileName = 'glice-daily-summary-' + todayStr() + '.pdf';
    var file = new File([pdfBlob], fileName, { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: 'Glice Daily Summary' }).catch(function () {});
    } else {
      var url = URL.createObjectURL(pdfBlob);
      var a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    }
  }).catch(function (err) {
    console.error('Could not build PDF:', err);
    showToast('Could not export PDF', true);
  });
}

(function initExportPdfButton() {
  var btn = document.getElementById('exportPdfBtn');
  if (btn) btn.addEventListener('click', exportTodaysPdfSummary);
})();

/* ---------- Video Library (hub + categories, data-driven) ---------- */

var videoLibraryData = null;
try {
  var videoDataTag = document.getElementById('videoLibraryData');
  videoLibraryData = JSON.parse(videoDataTag.textContent);
} catch (err) {
  console.error('Could not read video library data:', err);
}

function findVideoCategory(id) {
  return videoLibraryData.categories.find(function (c) { return c.id === id; });
}

function renderVideoHub() {
  var grid = document.getElementById('videoCategoryGrid');
  if (!grid || !videoLibraryData) return;
  grid.innerHTML = '';
  videoLibraryData.categories.forEach(function (cat) {
    var card = el('button', 'module-card');
    card.type = 'button';
    var title = el('span', 'module-card__title', cat.label);
    var desc = el('span', 'module-card__desc', cat.videos.length + (cat.videos.length === 1 ? ' video' : ' videos'));
    card.appendChild(title);
    card.appendChild(desc);
    card.addEventListener('click', function () { openVideoCategory(cat.id); });
    grid.appendChild(card);
  });
}

function openVideoCategory(categoryId) {
  var cat = findVideoCategory(categoryId);
  if (!cat) return;

  document.getElementById('videoCategoryTitle').textContent = cat.label;

  var playerWrap = document.getElementById('videoPlayerWrap');
  var frame = document.getElementById('videoPlayerFrame');
  frame.src = '';
  playerWrap.hidden = true;

  var list = document.getElementById('videoCategoryList');
  list.innerHTML = '';
  cat.videos.forEach(function (video) {
    var row = el('button', 'task-row video-row');
    row.type = 'button';
    var icon = el('span', 'video-row__icon');
    icon.innerHTML = '&#9654;';
    var label = el('span', 'task-row__label', video.title);
    row.appendChild(icon);
    row.appendChild(label);
    row.addEventListener('click', function () {
      frame.src = 'https://player.vimeo.com/video/' + video.vimeoId + '?autoplay=1';
      row.insertAdjacentElement('afterend', playerWrap);
      playerWrap.hidden = false;
      playerWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    list.appendChild(row);
  });

  showScreen('video-category');
}

renderVideoHub();

// Stop playback whenever any "Back" button is used, so audio/video
// doesn't keep running once you've left the screen.
document.querySelectorAll('[data-back]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var frame = document.getElementById('videoPlayerFrame');
    var playerWrap = document.getElementById('videoPlayerWrap');
    if (frame) frame.src = '';
    if (playerWrap) playerWrap.hidden = true;
  });
});

(function initSupportScreen() {
  var btn = document.getElementById('contactSupportBtn');
  if (!btn) return;

  btn.addEventListener('click', function () {
    var messageBox = document.getElementById('supportMessage');
    var userText = messageBox.value.trim();
    var subject = 'Glice Operator App — Support Request';
    var body = userText || 'Please describe your issue here.';
    var mailtoUrl = 'mailto:helpdesk@glice.com'
      + '?subject=' + encodeURIComponent(subject)
      + '&body=' + encodeURIComponent(body);
    window.location.href = mailtoUrl;
  });
})();

/* ---------- Home screen context (date, rink summary, today's progress) ---------- */

function profileSummaryText(profile) {
  var parts = [];
  if (profile.location) parts.push(profile.location === 'indoor' ? 'Indoor' : 'Outdoor');
  if (profile.rinkSize) parts.push(profile.rinkSize + ' m²');
  if (profile.offersSkateRental === 'yes') parts.push('Skate rental');
  return parts.length ? parts.join(' · ') : null;
}

function renderHomeContext() {
  var dateEl = document.getElementById('homeDate');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  }

  var summaryEl = document.getElementById('homeRinkSummary');
  if (summaryEl) {
    var summary = isProfileComplete() ? profileSummaryText(getProfile()) : null;
    summaryEl.textContent = summary || 'Set up your Rink Profile to get started';
  }

  var progressEl = document.getElementById('heroProgress');
  if (progressEl && !isProfileComplete()) {
    progressEl.textContent = 'Complete your Rink Profile to unlock the checklist';
  } else if (progressEl) {
    openDb().then(function (db) {
      var tx = db.transaction(STORE_NAME, 'readonly');
      var store = tx.objectStore(STORE_NAME);
      var count = 0;
      store.openCursor().onsuccess = function (e) {
        var cursor = e.target.result;
        if (cursor) {
          if (cursor.value.date === todayStr() && cursor.value.completed) count++;
          cursor.continue();
        } else {
          progressEl.textContent = count === 0
            ? "Nothing logged yet today — tap to start"
            : count + (count === 1 ? ' task' : ' tasks') + ' completed today';
        }
      };
    }).catch(function () {
      progressEl.textContent = "Open today's checklist";
    });
  }
}

renderHomeContext();
document.querySelectorAll('[data-back]').forEach(function (btn) {
  btn.addEventListener('click', renderHomeContext);
});

/* ---------- Install prompt (banner on Home / Rink Profile + instructions screen) ---------- */

var INSTALL_DISMISS_KEY = 'glice_install_tip_dismissed';
var deferredInstallPrompt = null;

function isStandalone() {
  return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true;
}

function isIOSDevice() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function buildInstallBanner(canPrompt) {
  var box = el('div', 'install-banner');
  box.appendChild(el('strong', 'install-banner__title', 'Install this app'));

  var text = canPrompt
    ? 'Add it to your device: it opens full screen and works without a connection.'
    : 'Tap Share, then "Add to Home Screen", and open the app from there. Do this before setting up your profile: Safari and the installed app do not share data.';
  box.appendChild(el('p', 'install-banner__text', text));

  var actions = el('div', 'install-banner__actions');
  if (canPrompt) {
    var installBtn = el('button', 'btn-primary', 'Install');
    installBtn.type = 'button';
    installBtn.addEventListener('click', triggerInstall);
    actions.appendChild(installBtn);
  }
  var dismissBtn = el('button', 'install-banner__dismiss', canPrompt ? 'Not now' : 'Got it');
  dismissBtn.type = 'button';
  dismissBtn.addEventListener('click', function () {
    localStorage.setItem(INSTALL_DISMISS_KEY, '1');
    renderInstallUi();
  });
  actions.appendChild(dismissBtn);
  box.appendChild(actions);
  return box;
}

function triggerInstall() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  deferredInstallPrompt.userChoice.then(function () {
    deferredInstallPrompt = null;
    renderInstallUi();
  });
}

function renderInstallUi() {
  var canPrompt = !!deferredInstallPrompt;
  var dismissed = !!localStorage.getItem(INSTALL_DISMISS_KEY);
  var show = !isStandalone() && !dismissed && (canPrompt || isIOSDevice());

  document.querySelectorAll('.install-banner-slot').forEach(function (slot) {
    slot.innerHTML = '';
    if (show) slot.appendChild(buildInstallBanner(canPrompt));
  });

  var nowBtn = document.getElementById('installNowBtn');
  if (nowBtn) nowBtn.hidden = !(canPrompt && !isStandalone());
}

window.addEventListener('beforeinstallprompt', function (e) {
  e.preventDefault();
  deferredInstallPrompt = e;
  renderInstallUi();
});

window.addEventListener('appinstalled', function () {
  deferredInstallPrompt = null;
  renderInstallUi();
});

(function initInstallScreen() {
  var nowBtn = document.getElementById('installNowBtn');
  if (nowBtn) nowBtn.addEventListener('click', triggerInstall);
  var standaloneMsg = document.getElementById('installStandaloneMsg');
  if (standaloneMsg) standaloneMsg.hidden = !isStandalone();
  renderInstallUi();
})();
