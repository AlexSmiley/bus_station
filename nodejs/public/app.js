const $ = (selector) => document.querySelector(selector);
const date = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
$('#current-date').textContent = date.format(new Date());

const modules = {
  tickets: ['Ticketing', 'Manage ticket sales, issue updates, and passenger transactions.'],
  routes: ['Routes & schedules', 'Manage route definitions, timetables, and departure information.'],
  employees: ['Employees', 'Manage station employees and operational staff.'],
  fleet: ['Fleet & vehicles', 'Manage vehicles, fleet assignments, and garage information.'],
  maintenance: ['Maintenance', 'Track inspections, maintenance activities, and spare parts.']
};

function setStatus(id, state, label) {
  const pill = document.getElementById(id);
  pill.className = `status-pill ${state}`;
  pill.innerHTML = `<i></i> ${label}`;
}

function setResult(id, text, state) {
  const element = document.getElementById(id);
  element.textContent = text;
  element.className = `service-result ${state || ''}`;
}

async function getJson(path) {
  const response = await fetch(path, { headers: { Accept: 'application/json' }, cache: 'no-store' });
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error?.message || `Request failed (${response.status})`);
  return body;
}

async function refreshStatus() {
  $('#refresh-button').classList.add('spinning');
  setStatus('api-status-pill', 'checking', 'Checking');
  setStatus('db-status-pill', 'checking', 'Checking');
  try {
    const [live, status] = await Promise.all([
      getJson('/health/live'),
      getJson('/api/v1/system/status')
    ]);
    let ready = null;
    let readinessError = null;
    try { ready = await getJson('/api/v1/system/ready'); } catch (error) { readinessError = error; }
    const apiUp = live.status === 'UP' && status.status === 'UP';
    $('#api-status').textContent = apiUp ? 'Operational' : 'Unavailable';
    $('#api-detail').textContent = `${status.runtime} · ${status.application}`;
    setStatus('api-status-pill', apiUp ? 'good' : 'bad', apiUp ? 'Healthy' : 'Error');
    setResult('live-result', live.status === 'UP' ? 'Healthy' : 'Unavailable', live.status === 'UP' ? 'ok' : 'fail');
    setResult('status-result', status.status === 'UP' ? 'Operational' : 'Unavailable', status.status === 'UP' ? 'ok' : 'fail');
    const db = ready?.database;
    if (status.database === 'disabled' || db?.configured === false) {
      $('#db-status').textContent = 'Not configured';
      $('#db-detail').textContent = 'Oracle integration is disabled';
      setStatus('db-status-pill', 'neutral', 'Disabled');
      setResult('ready-result', 'API ready · DB disabled', '');
    } else if (db?.connected) {
      $('#db-status').textContent = 'Connected';
      $('#db-detail').textContent = 'Oracle connection verified';
      setStatus('db-status-pill', 'good', 'Connected');
      setResult('ready-result', 'All dependencies ready', 'ok');
    } else {
      $('#db-status').textContent = 'Unavailable';
      $('#db-detail').textContent = 'Oracle connection could not be verified';
      setStatus('db-status-pill', 'bad', 'Unavailable');
      setResult('ready-result', readinessError ? 'Dependency unavailable' : 'Dependency unavailable', 'fail');
    }
    $('#last-updated').textContent = `Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } catch (error) {
    $('#api-status').textContent = 'Unavailable';
    $('#api-detail').textContent = error.message;
    setStatus('api-status-pill', 'bad', 'Offline');
    $('#db-status').textContent = 'Unknown';
    $('#db-detail').textContent = 'Could not read database status';
    setStatus('db-status-pill', 'bad', 'Unknown');
    setResult('live-result', 'Request failed', 'fail');
    setResult('status-result', 'Request failed', 'fail');
    setResult('ready-result', 'Request failed', 'fail');
    $('#last-updated').textContent = 'Unable to reach API';
  } finally {
    $('#refresh-button').classList.remove('spinning');
  }
}

function showView(view) {
  const isOverview = view === 'overview';
  $('#overview-view').hidden = !isOverview;
  $('#module-view').hidden = isOverview;
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.view === view));
  if (!isOverview && modules[view]) {
    $('#module-title').textContent = modules[view][0];
    $('#module-description').textContent = modules[view][1];
  }
  $('#breadcrumb-current').textContent = isOverview ? 'Overview' : modules[view]?.[0] || 'Overview';
  $('#sidebar').classList.remove('open');
}

document.querySelectorAll('.nav-item').forEach((item) => item.addEventListener('click', () => showView(item.dataset.view)));
$('#refresh-button').addEventListener('click', refreshStatus);
$('#check-now').addEventListener('click', refreshStatus);
$('#menu-toggle').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
document.addEventListener('click', (event) => {
  const sidebar = $('#sidebar');
  if (sidebar.classList.contains('open') && !sidebar.contains(event.target) && !$('#menu-toggle').contains(event.target)) {
    sidebar.classList.remove('open');
  }
});

refreshStatus();
setInterval(refreshStatus, 30_000);
