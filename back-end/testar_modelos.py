from google import genai

print("--- INICIANDO O TESTE DA API KEY ---")

# Substitua pela sua chave nova (do Gmail pessoal)
SUA_API_KEY = "AQ.Ab8RN6Ko97WL2XgJsRhGMhBphieSqKQ0PlOp8-9Wis1h96jRSg" 

try:
    client = genai.Client(api_key=SUA_API_KEY)
    print("Conectando ao Google...")
    
    # O comando correto na biblioteca nova é client.models.list()
    modelos = list(client.models.list())
    
    if len(modelos) == 0:
        print("AVISO: O Google respondeu, mas não liberou NENHUM modelo para esta chave (Cota zerada/bloqueada).")
    else:
        print(f"SUCESSO! O Google liberou {len(modelos)} modelos para esta chave. Aqui estão os principais:")
        for modelo in modelos:
            # Vamos imprimir apenas o nome do modelo para facilitar a leitura
            print(f"- {modelo.name}")
            
except Exception as e:
    print(f"ERRO CRÍTICO NA COMUNICAÇÃO: {e}")

print("--- FIM DO TESTE ---")