# Organize Config Editor

Organize의 `config.yaml` 파일을 시각적으로 작성하기 위한 간단한 웹 도구입니다. Flask 백엔드와 HTML/CSS/JS 기반의 SPA로 구성되어 있으며, Anchor와 Rule을 추가하여 YAML 파일로 다운로드할 수 있습니다.

## 실행 방법

```bash
pip install -r requirements.txt
python organize_web/app.py
```

브라우저에서 `http://localhost:5000` 에 접속하면 GUI를 사용할 수 있습니다. 작성한 설정은 `Download YAML` 버튼을 통해 `config.yaml` 파일로 저장됩니다.
앵커와 규칙은 테이블 형태로 표시되며 삭제 버튼으로 손쉽게 수정할 수 있습니다.
