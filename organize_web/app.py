from flask import Flask, render_template, request, send_file, jsonify
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
        seq = CommentedSeq(a.get('values', []))
        seq.yaml_set_anchor(a.get('name'))
        root[a.get('key')] = seq
        anchor_objects[a.get('name')] = seq

    rules_seq = CommentedSeq()
    for r in rules:
        rm = CommentedMap()
        rm['name'] = r.get('name')
        loc_anchor = r.get('location')
        rm['locations'] = anchor_objects.get(loc_anchor, loc_anchor)
        rm['subfolders'] = bool(r.get('subfolders'))
        rm['targets'] = r.get('targets')
        filt_words = r.get('filter', [])
        filt_anchor = r.get('filter_anchor')
        if filt_words or filt_anchor:
            filt = CommentedMap()
            name_map = CommentedMap()
            if filt_anchor:
                name_map['contains'] = anchor_objects.get(filt_anchor, filt_anchor)
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
        name = value.anchor.value if getattr(value, 'anchor', None) else key
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

@app.route('/download', methods=['POST'])
def download_yaml():
    data = request.get_json()
    yaml_text = build_yaml(data)
    file_io = io.BytesIO(yaml_text.encode('utf-8'))
    file_io.seek(0)
    return send_file(file_io, as_attachment=True, download_name='config.yaml', mimetype='text/yaml')


@app.route('/load', methods=['POST'])
def load_yaml():
    file = request.files.get('file')
    if not file:
        return jsonify({'anchors': [], 'keyword_anchors': [], 'rules': []})
    content = file.read().decode('utf-8')
    data = parse_yaml(content)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
