from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from google import genai
from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
import io

app = FastAPI(title="Motor de Notificações CAJ")

# Permite que o front-end React acesse a API sem erros de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em produção, coloque a URL do seu React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos de dados esperados pelo front-end
class GerarTextoRequest(BaseModel):
    api_key: str
    textos_base: list[str]

class ExportarWordRequest(BaseModel):
    texto_final: str

@app.post("/api/gerar")
def gerar_notificacao(req: GerarTextoRequest):
    if not req.api_key:
        raise HTTPException(status_code=400, detail="API Key é obrigatória.")
    
    try:
        client = genai.Client(api_key=req.api_key)
        
        textos_juntos = "\n---\n".join(req.textos_base)
        
        # O Prompt agora força estritamente o layout que você exigiu
        prompt = f"""
        Você é o assistente jurídico do sistema. Sua tarefa é ler as infrações brutas abaixo e consolidá-las NO EXATO FORMATO exigido a seguir. 
        Não adicione saudações ou textos extras. Apenas preencha o template.
        
        Se houver mais de uma infração, some as informações nos campos "Descrição do fato gerador", "Dispositivo legal" e "Penalidade prevista" de forma coesa.
        Deixe os campos de Data, Protocolo, Funcionário e Equipe vazios.

        FORMATO OBRIGATÓRIO:
        Descrição do fato gerador: [Suas consolidações aqui]
        Dispositivo legal infringido: [Suas consolidações aqui]
        Data da constatação: 
        Protocolo: 
        Funcionário: 
        Equipe: 
        Penalidade prevista: [Suas consolidações aqui]

        INFRAÇÕES BRUTAS (SELECIONADAS PELO USUÁRIO):
        {textos_juntos}
        """
        
        resposta = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt
        )
        return {"texto_gerado": resposta.text.strip()}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/exportar_word")
def exportar_word(req: ExportarWordRequest):
    doc = Document()
    
    # Configuração de Margens Padrão Jurídico
    for section in doc.sections:
        section.top_margin = Inches(1.18)
        section.left_margin = Inches(1.18)
        section.bottom_margin = Inches(0.78)
        section.right_margin = Inches(0.78)

    # Fonte Padrão
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Arial'
    font.size = Pt(12)

    # Corpo do Documento
    p_corpo = doc.add_paragraph()
    p_corpo.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_corpo.paragraph_format.line_spacing = 1.5
    p_corpo.add_run(req.texto_final)

    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer, 
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": "attachment; filename=Notificacao.docx"}
    )