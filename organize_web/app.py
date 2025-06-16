from flask import Flask, render_template, request, send_file
from ruamel.yaml import YAML
from ruamel.yaml.comments import CommentedMap, CommentedSeq
import io

app = Flask(__name__)

yaml = YAML()

def build_yaml(data):
    anchors = data.get('anchors', [])
    rules = data.get('rules', [])

    root = CommentedMap()
    anchor_objects = {}
    for a in anchors:
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
        if filt_words:
            filt = CommentedMap()
            name_map = CommentedMap()
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

if __name__ == '__main__':
    app.run(debug=True)
