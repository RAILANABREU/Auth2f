

# 🧩 Auth2f — Sistema de Autenticação com 2 Fatores e Armazenamento Cifrado

Projeto acadêmico e prático que implementa:
	•	Autenticação de dois fatores (TOTP)
	•	Upload e cifragem de arquivos locais (AES-GCM + scrypt)
	•	Backend em FastAPI com SQLite
	•	Frontend em React + TypeScript (Joy UI)

⸻

📁 Estrutura do projeto

Auth2f/
├── Backend/           # API em FastAPI + SQLite
│   ├── app/
│   ├── database/
│   ├── models/
│   ├── repositories/
│   ├── security/
│   └── main.py
│
├── Frontend/          # Interface Web (React + Joy UI)
│   ├── src/
│   ├── public/
│   └── vite.config.ts
│
└── README.md


⸻

🚀 Requisitos
	•	Python 3.11+
	•	Node.js 18+ e npm ou yarn
	•	macOS (ou Linux)
	•	Portas fixas (por enquanto):
	•	Backend → 4004
	•	Frontend → 8081

⸻

⚙️ 1. Configurando o Backend

🧭 Caminho

cd Auth2f/Backend

🧱 Criar ambiente virtual

python3 -m venv .venv
source .venv/bin/activate

📦 Instalar dependências

pip install -r requirements.txt

🧰 Inicializar o banco SQLite

(O projeto cria automaticamente o app.db ao rodar.)

Se quiser resetar:

rm app.db

▶️ Rodar servidor FastAPI

uvicorn app.main:app --reload --host 0.0.0.0 --port 4004

🔍 Verificar se está rodando

Abra no navegador:

http://127.0.0.1:4004/docs

⚠️ CORS

O backend já está configurado para aceitar requisições de qualquer origem:

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


⸻

💻 2. Configurando o Frontend

🧭 Caminho

cd ../Frontend

📦 Instalar dependências

npm install
# ou
yarn install

🔧 Arquivo de ambiente

Crie o arquivo .env na pasta Frontend/ com:

VITE_API_URL=http://127.0.0.1:4004

▶️ Rodar o servidor de desenvolvimento

npm run dev
# ou
yarn dev

O app estará acessível em:

http://localhost:8081


⸻

🧪 Testando o fluxo
	1.	Registrar usuário
	•	Acesse /register
	•	Crie usuário + senha
	•	O sistema exibirá um QR Code → escaneie com o Google Authenticator
	2.	Login
	•	Faça login → será gerado um pre2fa_token
	3.	Verificação 2FA
	•	Informe o código TOTP (6 dígitos)
	•	Receberá access_token → redirecionamento para /app/files
	4.	Envio de arquivo
	•	Clique no botão de upload
	•	O arquivo será cifrado localmente e enviado para /files/upload-multipart
	•	Toast “Arquivo salvo com sucesso”
	5.	Listagem e download
	•	/app/files mostra a lista dos arquivos enviados
	•	Cada item tem botão de download (retorna envelope JSON)

⸻

🧰 Scripts úteis

🧹 Limpar dependências e cache

rm -rf node_modules .vite dist
rm -rf __pycache__ */__pycache__

🧪 Linter e tipagem (opcional)

npm run lint
mypy app/


⸻

🧭 Resumo rápido de comandos

Etapa	Comando
Criar ambiente virtual	python3 -m venv .venv && source .venv/bin/activate
Instalar dependências (backend)	pip install -r requirements.txt
Rodar backend	uvicorn app.main:app --reload --port 4004
Instalar dependências (frontend)	npm install
Rodar frontend	npm run dev
Acessar API docs	http://127.0.0.1:4004/docs
Acessar app	http://localhost:8081


⸻

📌 Observações
	•	As portas estão fixas (4004 e 8081) — ajuste depois no .env e main.py.
	•	O backend usa SQLite local (app.db), então não precisa de servidor de banco.
	•	Em produção, será necessário adicionar:
	•	Controle de CORS mais restritivo
	•	Tokens JWT com expiração curta e refresh
	•	Armazenamento seguro para arquivos (ex.: S3, Azure Blob, etc.)

