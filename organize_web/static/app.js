let anchors = [];
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

function updateRuleList() {
  const tbody = document.querySelector('#rule-table tbody');
  tbody.innerHTML = '';
  rules.forEach((r, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.name}</td><td>*${r.location}</td><td>${r.targets}</td>` +
      `<td>${r.subfolders ? '✓' : ''}</td><td>${r.filter.join(', ')}</td><td>${r.move}</td>`;
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
  const filter = document.getElementById('rule-filter').value.split(',').map(v => v.trim()).filter(v => v);
  const move = document.getElementById('rule-move').value.trim();
  if (!name || !move) return;
  rules.push({ name, location, subfolders, targets, filter, move });
  document.getElementById('rule-name').value = '';
  document.getElementById('rule-filter').value = '';
  document.getElementById('rule-move').value = '';
  updateRuleList();
}

function downloadYaml() {
  fetch('/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ anchors, rules })
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
