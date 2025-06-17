from flask import Flask, render_template, request, jsonify
import os
import datetime
from ruamel.yaml import YAML
from ruamel.yaml.comments import CommentedMap, CommentedSeq
import io

app = Flask(__name__)

yaml = YAML()

def build_yaml(data):
    anchors = data.get('anchors', [])
    keyword_anchors = data.get('keyword_anchors', [])
    rules = data.get('rules', [])

    root = CommentedMap()
    anchor_objects = {}
    for a in anchors + keyword_anchors:
        vals = a.get('values', [])
        if not isinstance(vals, list):
            vals = [v for v in [vals] if v not in (None, '')]
        seq = CommentedSeq(vals)
        name = a.get('name')
        if name:
            seq.yaml_set_anchor(str(name), always_dump=True)
            anchor_objects[str(name)] = seq
        root[a.get('key')] = seq

    rules_seq = CommentedSeq()
    for r in rules:
        rm = CommentedMap()
        rm['name'] = r.get('name')
        loc_anchor = r.get('location')
        if loc_anchor and loc_anchor in anchor_objects:
            rm['locations'] = anchor_objects[loc_anchor]
        else:
            rm['locations'] = loc_anchor
        rm['subfolders'] = bool(r.get('subfolders'))
        rm['targets'] = r.get('targets')
        filt_words = r.get('filter', [])
        filt_anchor = r.get('filter_anchor')
        if filt_words or filt_anchor:
            filt = CommentedMap()
            name_map = CommentedMap()
            if filt_anchor and filt_anchor in anchor_objects:
                name_map['contains'] = anchor_objects[filt_anchor]
            else:
                name_map['contains'] = CommentedSeq(filt_words)
            name_map['case_sensitive'] = False
            filt['name'] = name_map
            rm['filters'] = CommentedSeq([filt])
        rm['actions'] = CommentedSeq([CommentedMap({'move': r.get('move')})])
        rules_seq.append(rm)
    root['rules'] = rules_seq
    stream = io.StringIO()
    yaml.dump(root, stream)
    return stream.getvalue()

def parse_yaml(text):
    y = YAML(typ='rt')
    data = y.load(text)
    anchors = []
    anchor_usage_loc = set()
    anchor_usage_kw = set()

    for key, value in data.items():
        if key == 'rules':
            continue
        if getattr(value, 'anchor', None) and value.anchor.value is not None:
            name = value.anchor.value
        else:
            name = ''
        anchors.append({'key': key, 'name': name, 'values': list(value)})

    rules = []
    for r in data.get('rules', []):
        rule = {
            'name': r.get('name', ''),
            'location': None,
            'subfolders': bool(r.get('subfolders')),
            'targets': r.get('targets', 'files'),
            'filter': [],
            'filter_anchor': None,
            'move': r.get('actions', [{}])[0].get('move', '')
        }
        loc = r.get('locations')
        if getattr(loc, 'anchor', None):
            rule['location'] = loc.anchor.value
            anchor_usage_loc.add(loc.anchor.value)
        elif isinstance(loc, list):
            rule['location'] = ''
        else:
            rule['location'] = loc

        filt = r.get('filters')
        if filt:
            contains = filt[0].get('name', {}).get('contains')
            if getattr(contains, 'anchor', None):
                rule['filter_anchor'] = contains.anchor.value
                anchor_usage_kw.add(contains.anchor.value)
            elif isinstance(contains, list):
                rule['filter'] = list(contains)

        rules.append(rule)

    path_anchors = []
    keyword_anchors = []
    for a in anchors:
        if a['name'] in anchor_usage_kw and a['name'] not in anchor_usage_loc:
            keyword_anchors.append(a)
        else:
            path_anchors.append(a)

    return {'anchors': path_anchors, 'keyword_anchors': keyword_anchors, 'rules': rules}

@app.route('/')
def index():
    return render_template('index.html')

CONFIG_PATH = os.path.join(os.path.dirname(__file__), 'config.yaml')

@app.route('/save', methods=['POST'])
def save_yaml():
    req = request.get_json()
    path = req.get('path') or CONFIG_PATH
    data = req.get('data', {})
    yaml_text = build_yaml(data)

    if os.path.exists(path):
        hist_dir = os.path.join(os.path.dirname(path), 'history')
        os.makedirs(hist_dir, exist_ok=True)
        ts = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
        backup = os.path.join(hist_dir, f'config_{ts}.yaml')
        with open(path, 'r', encoding='cp949') as rf, open(backup, 'w', encoding='cp949') as bf:
            bf.write(rf.read())

    with open(path, 'w', encoding='cp949') as f:
        f.write(yaml_text)
    return jsonify({'status': 'ok'})


@app.route('/load', methods=['POST'])
def load_yaml():
    req = request.get_json()
    path = req.get('path') or CONFIG_PATH
    if not os.path.isfile(path):
        return jsonify({'anchors': [], 'keyword_anchors': [], 'rules': []})
    with open(path, 'r', encoding='cp949') as f:
        content = f.read()
    data = parse_yaml(content)
    return jsonify(data)


@app.route('/browse', methods=['POST'])
def browse_yaml():
    """Open a native file dialog on the server to select a YAML file."""
    try:
        import tkinter as tk
        from tkinter import filedialog
        root = tk.Tk()
        root.withdraw()
        path = filedialog.askopenfilename(filetypes=[('YAML files', '*.yaml'), ('All files', '*.*')])
        root.destroy()
    except Exception:
        path = ''
    return jsonify({'path': path})


@app.route('/export', methods=['POST'])
def export_yaml():
    req = request.get_json()
    data = req.get('data', {})
    yaml_text = build_yaml(data)
    return jsonify({'yaml': yaml_text})

if __name__ == '__main__':
    app.run(debug=True)
