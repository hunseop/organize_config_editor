let anchors = [];
let rules = [];
let configPath = '';
let anchorEdit = -1;
let ruleEdit = -1;
const PAGE_SIZE = 5;
let anchorPage = 1;
let rulePage = 1;
let anchorDrag = null;
let ruleDrag = null;

function browsePath() {
  fetch('/browse', { method: 'POST' })
    .then(resp => resp.json())
    .then(data => {
      if (data.path) {
        document.getElementById('config-path').value = data.path;
        loadYaml();
      }
    });
}

function filteredAnchors() {
  const term = document.getElementById('anchor-search').value.toLowerCase();
  return anchors.filter(a =>
    a.key.toLowerCase().includes(term) ||
    a.name.toLowerCase().includes(term) ||
    a.values.join(', ').toLowerCase().includes(term)
  );
}

function updateAnchorList() {
  const list = filteredAnchors();
  const tbody = document.querySelector('#anchor-table tbody');
  const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  if (anchorPage > pageCount) anchorPage = pageCount;
  tbody.innerHTML = '';
  const start = (anchorPage - 1) * PAGE_SIZE;
  const pageData = list.slice(start, start + PAGE_SIZE);
  pageData.forEach((a, idx) => {
    const realIdx = start + idx;
    const tr = document.createElement('tr');
    tr.classList.add('fade-enter');
    tr.draggable = true;
    tr.dataset.index = realIdx;
    tr.addEventListener('dragstart', () => { anchorDrag = realIdx; });
    tr.addEventListener('dragover', e => e.preventDefault());
    tr.addEventListener('drop', () => moveAnchor(anchorDrag, realIdx));

    tr.innerHTML = `<td class="drag-handle">↕</td><td>${a.key}</td><td>&${a.name}</td><td>${a.values.join(', ')}</td>`;

    const tdAction = document.createElement('td');
    tdAction.className = 'actions';
    tdAction.innerHTML = `<button onclick="toggleAnchorMenu(this)">Actions</button>` +
      `<div class="action-menu"><button onclick="editAnchor(${realIdx})">Edit</button>` +
      `<button onclick="deleteAnchor(${realIdx})">Delete</button></div>`;
    tr.appendChild(tdAction);
    tbody.appendChild(tr);
  });

  document.getElementById('anchor-page-info').textContent = `${anchorPage} / ${pageCount}`;

  const select = document.getElementById('rule-location');
  select.innerHTML = '';
  anchors.forEach(a => {
    const option = document.createElement('option');
    option.value = a.name;
    option.textContent = `*${a.name}`;
    select.appendChild(option);
  });
  updateRuleFilterAnchors();
}

function addAnchor() {
  const key = document.getElementById('anchor-key').value.trim();
  const name = document.getElementById('anchor-name').value.trim();
  const values = document.getElementById('anchor-values').value.split(',').map(v => v.trim()).filter(v => v);
  if (!key || !name || values.length === 0) return;
  if (anchorEdit !== -1) {
    anchors[anchorEdit] = { key, name, values };
    anchorEdit = -1;
    document.getElementById('add-anchor-btn').textContent = 'Add Anchor';
  } else {
    anchors.push({ key, name, values });
  }
  document.getElementById('anchor-key').value = '';
  document.getElementById('anchor-name').value = '';
  document.getElementById('anchor-values').value = '';
  updateAnchorList();
}

function editAnchor(idx) {
  const a = anchors[idx];
  document.getElementById('anchor-key').value = a.key;
  document.getElementById('anchor-name').value = a.name;
  document.getElementById('anchor-values').value = a.values.join(', ');
  anchorEdit = idx;
  document.getElementById('add-anchor-btn').textContent = 'Update Anchor';
}

function moveAnchor(from, to) {
  if (from === to || from == null || to == null) return;
  const item = anchors.splice(from, 1)[0];
  anchors.splice(to, 0, item);
  updateAnchorList();
}

function prevAnchorPage() {
  if (anchorPage > 1) {
    anchorPage--;
    updateAnchorList();
  }
}

function nextAnchorPage() {
  const count = Math.max(1, Math.ceil(filteredAnchors().length / PAGE_SIZE));
  if (anchorPage < count) {
    anchorPage++;
    updateAnchorList();
  }
}

function toggleAnchorMenu(btn) {
  document.querySelectorAll('.action-menu.show').forEach(m => m.classList.remove('show'));
  const menu = btn.nextElementSibling;
  menu.classList.toggle('show');
}

function deleteAnchor(idx) {
  anchors.splice(idx, 1);
  updateAnchorList();
  updateRuleList();
}


function updateRuleFilterAnchors() {
  const select = document.getElementById('rule-filter-anchor');
  select.innerHTML = '<option value="">(none)</option>';
  anchors.forEach(a => {
    const option = document.createElement('option');
    option.value = a.name;
    option.textContent = `*${a.name}`;
    select.appendChild(option);
  });
}

function filteredRules() {
  const term = document.getElementById('rule-search').value.toLowerCase();
  return rules.filter(r =>
    r.name.toLowerCase().includes(term) ||
    (r.location || '').toLowerCase().includes(term) ||
    r.move.toLowerCase().includes(term)
  );
}

function updateRuleList() {
  const list = filteredRules();
  const tbody = document.querySelector('#rule-table tbody');
  const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  if (rulePage > pageCount) rulePage = pageCount;
  tbody.innerHTML = '';
  const start = (rulePage - 1) * PAGE_SIZE;
  const pageData = list.slice(start, start + PAGE_SIZE);
  pageData.forEach((r, idx) => {
    const realIdx = start + idx;
    const tr = document.createElement('tr');
    tr.classList.add('fade-enter');
    tr.draggable = true;
    tr.dataset.index = realIdx;
    tr.addEventListener('dragstart', () => { ruleDrag = realIdx; });
    tr.addEventListener('dragover', e => e.preventDefault());
    tr.addEventListener('drop', () => moveRule(ruleDrag, realIdx));

    const filterText = r.filter_anchor ? `*${r.filter_anchor}` : r.filter.join(', ');
    tr.innerHTML = `<td class="drag-handle">↕</td><td>${r.name}</td><td>*${r.location}</td><td>${r.targets}</td>` +
      `<td>${r.subfolders ? '✓' : ''}</td><td>${filterText}</td><td>${r.move}</td>`;

    const tdAction = document.createElement('td');
    tdAction.className = 'actions';
    tdAction.innerHTML = `<button onclick="toggleRuleMenu(this)">Actions</button>` +
      `<div class="action-menu"><button onclick="editRule(${realIdx})">Edit</button>` +
      `<button onclick="deleteRule(${realIdx})">Delete</button></div>`;
    tr.appendChild(tdAction);
    tbody.appendChild(tr);
  });
  document.getElementById('rule-page-info').textContent = `${rulePage} / ${pageCount}`;
}

function addRule() {
  const name = document.getElementById('rule-name').value.trim();
  const location = document.getElementById('rule-location').value;
  const subfolders = document.getElementById('rule-subfolders').checked;
  const targets = document.getElementById('rule-targets').value;
  const filterAnchor = document.getElementById('rule-filter-anchor').value;
  const filter = document.getElementById('rule-filter').value.split(',').map(v => v.trim()).filter(v => v);
  const move = document.getElementById('rule-move').value.trim();
  if (!name || !move) return;
  if (ruleEdit !== -1) {
    rules[ruleEdit] = { name, location, subfolders, targets, filter, filter_anchor: filterAnchor, move };
    ruleEdit = -1;
    document.getElementById('add-rule-btn').textContent = 'Add Rule';
  } else {
    rules.push({ name, location, subfolders, targets, filter, filter_anchor: filterAnchor, move });
  }
  document.getElementById('rule-name').value = '';
  document.getElementById('rule-filter').value = '';
  document.getElementById('rule-move').value = '';
  updateRuleList();
}

function editRule(idx) {
  const r = rules[idx];
  document.getElementById('rule-name').value = r.name;
  document.getElementById('rule-location').value = r.location;
  document.getElementById('rule-subfolders').checked = r.subfolders;
  document.getElementById('rule-targets').value = r.targets;
  document.getElementById('rule-filter-anchor').value = r.filter_anchor || '';
  document.getElementById('rule-filter').value = r.filter.join(', ');
  document.getElementById('rule-move').value = r.move;
  ruleEdit = idx;
  document.getElementById('add-rule-btn').textContent = 'Update Rule';
}

function moveRule(from, to) {
  if (from === to || from == null || to == null) return;
  const item = rules.splice(from, 1)[0];
  rules.splice(to, 0, item);
  updateRuleList();
}

function prevRulePage() {
  if (rulePage > 1) {
    rulePage--;
    updateRuleList();
  }
}

function nextRulePage() {
  const count = Math.max(1, Math.ceil(filteredRules().length / PAGE_SIZE));
  if (rulePage < count) {
    rulePage++;
    updateRuleList();
  }
}

function toggleRuleMenu(btn) {
  document.querySelectorAll('.action-menu.show').forEach(m => m.classList.remove('show'));
  const menu = btn.nextElementSibling;
  menu.classList.toggle('show');
}

function deleteRule(idx) {
  rules.splice(idx, 1);
  updateRuleList();
}

function saveYaml() {
  const path = document.getElementById('config-path').value.trim();
  configPath = path;
  fetch('/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, data: { anchors, rules } })
  }).then(resp => resp.json()).then(() => alert('Saved'));
}

function downloadYaml() {
  fetch('/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { anchors, rules } })
  })
    .then(resp => resp.json())
    .then(data => {
      const blob = new Blob([data.yaml], { type: 'text/plain;charset=cp949' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'config.yaml';
      a.click();
      URL.revokeObjectURL(url);
    });
}

function loadYaml() {
  const path = document.getElementById('config-path').value.trim();
  configPath = path;
  fetch('/load', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path })
  })
    .then(resp => resp.json())
    .then(data => {
      anchors = data.anchors || [];
      rules = data.rules || [];
      updateAnchorList();
      updateRuleList();
    });
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.actions')) {
    document.querySelectorAll('.action-menu.show').forEach(m => m.classList.remove('show'));
  }
});
