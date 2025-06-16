# Organize Config Editor

Organize의 `config.yaml` 파일을 시각적으로 작성하기 위한 간단한 웹 도구입니다. Flask 백엔드와 HTML/CSS/JS 기반의 SPA로 구성되어 있으며, Anchor와 Rule을 추가하여 YAML 파일로 다운로드할 수 있습니다. 기존 YAML을 불러와 편집할 수도 있고, 위치용 앵커와 필터 키워드용 앵커를 각각 정의하여 재사용할 수 있습니다.

## 실행 방법

```bash
pip install -r requirements.txt
python organize_web/app.py
```

브라우저에서 `http://localhost:5000` 에 접속하면 GUI를 사용할 수 있습니다. 상단에 `config.yaml` 경로를 입력한 후 **Load** 버튼으로 불러오고 **Save** 버튼으로 저장합니다.
저장 시 기존 파일은 `history` 폴더에 시점별 백업이 남으므로 이전 설정을 보관할 수 있습니다.
앵커와 규칙은 테이블 형태로 표시되며 **편집**과 삭제 버튼을 통해 실시간으로 수정할 수 있습니다. 최신 버전에서는 더 밝고 가독성이 좋은 글래스모피즘 테마가 적용되었습니다.
