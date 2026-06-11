# Para rodar a API

1. Instalar dependencias

```bash
pip install fastapi uvicorn pydantic google-generativeai python-docx
```

```bash
python -m venv venv
```

```bash
.\venv\Scripts\activate
```

```bash
uvicorn api:app --reload --port 8001
```