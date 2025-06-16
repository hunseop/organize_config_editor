let anchors = [];
let rules = [];

function updateAnchorList() {
  const list = document.getElementById('anchor-list');
  list.innerHTML = '';
  anchors.forEach(a => {
    const li = document.createElement('li');
    li.textContent = `${a.key}: &${a.name} -> [${a.values.join(', ')}]`;
    list.appendChild(li);
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
  const list = document.getElementById('rule-list');
  list.innerHTML = '';
  rules.forEach(r => {
    const li = document.createElement('li');
    li.textContent = `${r.name} -> move to ${r.move}`;
    list.appendChild(li);
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
