let anchors = [];
let keywordAnchors = [];
let rules = [];
let configPath = '';
let anchorEdit = -1;
let kwEdit = -1;
let ruleEdit = -1;

function updateAnchorList() {
  const tbody = document.querySelector('#anchor-table tbody');
  tbody.innerHTML = '';
  anchors.forEach((a, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${a.key}</td><td>&${a.name}</td><td>${a.values.join(', ')}</td>`;
    const tdEdit = document.createElement('td');
    const edit = document.createElement('button');
    edit.textContent = 'Edit';
    edit.onclick = () => editAnchor(idx);
    tdEdit.appendChild(edit);
    const tdDel = document.createElement('td');
    const del = document.createElement('button');
    del.textContent = 'X';
    del.onclick = () => { anchors.splice(idx,1); updateAnchorList(); updateRuleList(); };
    tdDel.appendChild(del);
    tr.appendChild(tdEdit);
    tr.appendChild(tdDel);
    tbody.appendChild(tr);
  });

  const select = document.getElementById('rule-location');
  select.innerHTML = '';
  anchors.forEach(a => {
    const option = document.createElement('option');
    option.value = a.name;
    option.textContent = `*${a.name}`;
    select.appendChild(option);
  });
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

function updateKeywordAnchorList() {
  const tbody = document.querySelector('#kw-anchor-table tbody');
  tbody.innerHTML = '';
  keywordAnchors.forEach((a, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${a.key}</td><td>&${a.name}</td><td>${a.values.join(', ')}</td>`;
    const tdEdit = document.createElement('td');
    const edit = document.createElement('button');
    edit.textContent = 'Edit';
    edit.onclick = () => editKeywordAnchor(idx);
    tdEdit.appendChild(edit);
    const tdDel = document.createElement('td');
    const del = document.createElement('button');
    del.textContent = 'X';
    del.onclick = () => { keywordAnchors.splice(idx,1); updateKeywordAnchorList(); updateRuleFilterAnchors(); };
    tdDel.appendChild(del);
    tr.appendChild(tdEdit);
    tr.appendChild(tdDel);
    tbody.appendChild(tr);
  });
  updateRuleFilterAnchors();
}

function addKeywordAnchor() {
  const key = document.getElementById('kw-key').value.trim();
  const name = document.getElementById('kw-name').value.trim();
  const values = document.getElementById('kw-values').value.split(',').map(v => v.trim()).filter(v => v);
  if (!key || !name || values.length === 0) return;
  if (kwEdit !== -1) {
    keywordAnchors[kwEdit] = { key, name, values };
    kwEdit = -1;
    document.getElementById('add-kw-btn').textContent = 'Add Keyword Anchor';
  } else {
    keywordAnchors.push({ key, name, values });
  }
  document.getElementById('kw-key').value = '';
  document.getElementById('kw-name').value = '';
  document.getElementById('kw-values').value = '';
  updateKeywordAnchorList();
}

function editKeywordAnchor(idx) {
  const a = keywordAnchors[idx];
  document.getElementById('kw-key').value = a.key;
  document.getElementById('kw-name').value = a.name;
  document.getElementById('kw-values').value = a.values.join(', ');
  kwEdit = idx;
  document.getElementById('add-kw-btn').textContent = 'Update Keyword Anchor';
}

function updateRuleFilterAnchors() {
  const select = document.getElementById('rule-filter-anchor');
  select.innerHTML = '<option value="">(none)</option>';
  keywordAnchors.forEach(a => {
    const option = document.createElement('option');
    option.value = a.name;
    option.textContent = `*${a.name}`;
    select.appendChild(option);
  });
}

function updateRuleList() {
  const tbody = document.querySelector('#rule-table tbody');
  tbody.innerHTML = '';
  rules.forEach((r, idx) => {
    const tr = document.createElement('tr');
    const filterText = r.filter_anchor ? `*${r.filter_anchor}` : r.filter.join(', ');
    tr.innerHTML = `<td>${r.name}</td><td>*${r.location}</td><td>${r.targets}</td>` +
      `<td>${r.subfolders ? '✓' : ''}</td><td>${filterText}</td><td>${r.move}</td>`;
    const tdEdit = document.createElement('td');
    const edit = document.createElement('button');
    edit.textContent = 'Edit';
    edit.onclick = () => editRule(idx);
    tdEdit.appendChild(edit);
    const tdDel = document.createElement('td');
    const del = document.createElement('button');
    del.textContent = 'X';
    del.onclick = () => { rules.splice(idx,1); updateRuleList(); };
    tdDel.appendChild(del);
    tr.appendChild(tdEdit);
    tr.appendChild(tdDel);
    tbody.appendChild(tr);
  });
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

function saveYaml() {
  const path = document.getElementById('config-path').value.trim();
  configPath = path;
  fetch('/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, data: { anchors, keyword_anchors: keywordAnchors, rules } })
  }).then(resp => resp.json()).then(() => alert('Saved')); 
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
      keywordAnchors = data.keyword_anchors || [];
      rules = data.rules || [];
      updateAnchorList();
      updateKeywordAnchorList();
      updateRuleList();
    });
}
