let anchors = [];
let keywordAnchors = [];
let rules = [];

function updateAnchorList() {
  const tbody = document.querySelector('#anchor-table tbody');
  tbody.innerHTML = '';
  anchors.forEach((a, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${a.key}</td><td>&${a.name}</td><td>${a.values.join(', ')}</td>`;
    const tdBtn = document.createElement('td');
    const btn = document.createElement('button');
    btn.textContent = 'X';
    btn.onclick = () => { anchors.splice(idx,1); updateAnchorList(); updateRuleList(); };
    tdBtn.appendChild(btn);
    tr.appendChild(tdBtn);
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
  anchors.push({ key, name, values });
  document.getElementById('anchor-key').value = '';
  document.getElementById('anchor-name').value = '';
  document.getElementById('anchor-values').value = '';
  updateAnchorList();
}

function updateKeywordAnchorList() {
  const tbody = document.querySelector('#kw-anchor-table tbody');
  tbody.innerHTML = '';
  keywordAnchors.forEach((a, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${a.key}</td><td>&${a.name}</td><td>${a.values.join(', ')}</td>`;
    const tdBtn = document.createElement('td');
    const btn = document.createElement('button');
    btn.textContent = 'X';
    btn.onclick = () => { keywordAnchors.splice(idx,1); updateKeywordAnchorList(); updateRuleFilterAnchors(); };
    tdBtn.appendChild(btn);
    tr.appendChild(tdBtn);
    tbody.appendChild(tr);
  });
  updateRuleFilterAnchors();
}

function addKeywordAnchor() {
  const key = document.getElementById('kw-key').value.trim();
  const name = document.getElementById('kw-name').value.trim();
  const values = document.getElementById('kw-values').value.split(',').map(v => v.trim()).filter(v => v);
  if (!key || !name || values.length === 0) return;
  keywordAnchors.push({ key, name, values });
  document.getElementById('kw-key').value = '';
  document.getElementById('kw-name').value = '';
  document.getElementById('kw-values').value = '';
  updateKeywordAnchorList();
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
    const tdBtn = document.createElement('td');
    const btn = document.createElement('button');
    btn.textContent = 'X';
    btn.onclick = () => { rules.splice(idx,1); updateRuleList(); };
    tdBtn.appendChild(btn);
    tr.appendChild(tdBtn);
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
  rules.push({ name, location, subfolders, targets, filter, filter_anchor: filterAnchor, move });
  document.getElementById('rule-name').value = '';
  document.getElementById('rule-filter').value = '';
  document.getElementById('rule-move').value = '';
  updateRuleList();
}

function downloadYaml() {
  fetch('/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ anchors, keyword_anchors: keywordAnchors, rules })
  }).then(resp => resp.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'config.yaml';
      a.click();
      window.URL.revokeObjectURL(url);
    });
}

function loadYaml() {
  const fileInput = document.getElementById('yaml-file');
  if (!fileInput.files.length) return;
  const formData = new FormData();
  formData.append('file', fileInput.files[0]);
  fetch('/load', { method: 'POST', body: formData })
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
