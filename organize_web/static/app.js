let anchors = [];
let rules = [];
let configPath = '';
let anchorEdit = -1;
let ruleEdit = -1;
const PAGE_SIZE = 5;
let anchorPage = 1;
let rulePage = 1;

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
    tr.innerHTML = `<td>${a.key}</td><td>&${a.name}</td><td>${a.values.join(', ')}</td>`;
    const tdMove = document.createElement('td');
    tdMove.className = 'move-cell';
    const up = document.createElement('button');
    up.textContent = '↑';
    up.onclick = () => moveAnchorUp(realIdx);
    const down = document.createElement('button');
    down.textContent = '↓';
    down.onclick = () => moveAnchorDown(realIdx);
    tdMove.appendChild(up);
    tdMove.appendChild(down);
    const tdEdit = document.createElement('td');
    const edit = document.createElement('button');
    edit.textContent = 'Edit';
    edit.onclick = () => editAnchor(realIdx);
    tdEdit.appendChild(edit);
    const tdDel = document.createElement('td');
    const del = document.createElement('button');
    del.textContent = 'X';
    del.onclick = () => { anchors.splice(realIdx,1); updateAnchorList(); updateRuleList(); };
    tdDel.appendChild(del);
    tr.appendChild(tdMove);
    tr.appendChild(tdEdit);
    tr.appendChild(tdDel);
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

function moveAnchorUp(idx) {
  if (idx <= 0) return;
  [anchors[idx - 1], anchors[idx]] = [anchors[idx], anchors[idx - 1]];
  updateAnchorList();
}

function moveAnchorDown(idx) {
  if (idx >= anchors.length - 1) return;
  [anchors[idx + 1], anchors[idx]] = [anchors[idx], anchors[idx + 1]];
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
    const filterText = r.filter_anchor ? `*${r.filter_anchor}` : r.filter.join(', ');
    tr.innerHTML = `<td>${r.name}</td><td>*${r.location}</td><td>${r.targets}</td>` +
      `<td>${r.subfolders ? '✓' : ''}</td><td>${filterText}</td><td>${r.move}</td>`;
    const tdMove = document.createElement('td');
    tdMove.className = "move-cell";
    const up = document.createElement('button');
    up.textContent = '↑';
    up.onclick = () => moveRuleUp(realIdx);
    const down = document.createElement('button');
    down.textContent = '↓';
    down.onclick = () => moveRuleDown(realIdx);
    tdMove.appendChild(up);
    tdMove.appendChild(down);
    const tdEdit = document.createElement('td');
    const edit = document.createElement('button');
    edit.textContent = 'Edit';
    edit.onclick = () => editRule(realIdx);
    tdEdit.appendChild(edit);
    const tdDel = document.createElement('td');
    const del = document.createElement('button');
    del.textContent = 'X';
    del.onclick = () => { rules.splice(realIdx,1); updateRuleList(); };
    tdDel.appendChild(del);
    tr.appendChild(tdMove);
    tr.appendChild(tdEdit);
    tr.appendChild(tdDel);
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

function moveRuleUp(idx) {
  if (idx <= 0) return;
  [rules[idx - 1], rules[idx]] = [rules[idx], rules[idx - 1]];
  updateRuleList();
}

function moveRuleDown(idx) {
  if (idx >= rules.length - 1) return;
  [rules[idx + 1], rules[idx]] = [rules[idx], rules[idx + 1]];
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
