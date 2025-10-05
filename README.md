# 🧩 Auth2f — Sistema de Autenticação com 2 Fatores e Armazenamento Cifrado

Projeto acadêmico e prático que implementa:

- 🔐 Autenticação de dois fatores (TOTP)
- 🧱 Upload e cifragem de arquivos locais (AES-GCM + scrypt)
- ⚡ Backend em FastAPI com SQLite
- 🎨 Frontend em React + TypeScript (Joy UI)

---

## 📁 Estrutura do Projeto

```
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
```

---

## 🚀 Requisitos

- **Python 3.11+**
- **Node.js 18+** e **npm** ou **yarn**
- **macOS ou Linux**
- **Portas fixas (temporariamente):**
  - Backend → `4004`
  - Frontend → `8081`

---

## ⚙️ 1. Configuração do Backend

### 🧭 Acesse o diretório
```bash
cd Auth2f/Backend
```

### 🧱 Crie o ambiente virtual
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 📦 Instale as dependências
```bash
pip install -r requirements.txt
```

### 🧰 Inicialize o banco SQLite
(O projeto cria automaticamente o `app.db` ao rodar.)

Se quiser resetar:
```bash
rm app.db
```

### ▶️ Execute o servidor FastAPI
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 4004
```

### 🔍 Verifique se está rodando
Acesse no navegador:
```
http://127.0.0.1:4004/docs
```

### ⚠️ CORS
O backend está configurado para aceitar requisições de **qualquer origem**:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 💻 2. Configuração do Frontend

### 🧭 Acesse o diretório
```bash
cd ../Frontend
```

### 📦 Instale as dependências
```bash
npm install
# ou
yarn install
```

### 🔧 Crie o arquivo `.env`
Na pasta `Frontend/`:

```
VITE_API_URL=http://127.0.0.1:4004
```

### ▶️ Execute o servidor de desenvolvimento
```bash
npm run dev
# ou
yarn dev
```

O app estará acessível em:
```
http://localhost:8081
```

---

## 🧪 Testando o Fluxo Completo

1. **Registrar Usuário**
   - Acesse `/register`
   - Crie usuário + senha
   - O sistema exibirá um **QR Code** → escaneie com o Google Authenticator

2. **Login**
   - Faça login → será gerado um `pre2fa_token`

3. **Verificação 2FA**
   - Informe o código TOTP (6 dígitos)
   - Receberá `access_token` → redirecionamento para `/app/files`

4. **Upload de Arquivo**
   - Clique no botão de upload
   - O arquivo é cifrado localmente e enviado para `/files/upload-multipart`
   - Exibe um toast de sucesso: **“Arquivo salvo com sucesso”**

5. **Listagem e Download**
   - A página `/app/files` mostra os arquivos enviados
   - Cada item tem um botão para baixar (envelope JSON cifrado)

---

## 🧰 Scripts Úteis

### 🧹 Limpar dependências e cache
```bash
rm -rf node_modules .vite dist
rm -rf __pycache__ */__pycache__
```

### 🧪 Linter e tipagem (opcional)
```bash
npm run lint
mypy app/
```

---

## 🧭 Resumo Rápido de Comandos

| Etapa | Comando |
|-------|----------|
| Criar ambiente virtual | `python3 -m venv .venv && source .venv/bin/activate` |
| Instalar dependências (backend) | `pip install -r requirements.txt` |
| Rodar backend | `uvicorn app.main:app --reload --port 4004` |
| Instalar dependências (frontend) | `npm install` |
| Rodar frontend | `npm run dev` |
| Acessar API docs | `http://127.0.0.1:4004/docs` |
| Acessar app | `http://localhost:8081` |

---

## 📌 Observações

- As **portas estão fixas** (4004 e 8081) — ajuste futuramente no `.env` e `main.py`.
- O backend usa **SQLite local** (`app.db`) — não é necessário servidor de banco.

---

## ✨ Créditos

Desenvolvido por **Railan Abreu** e **Gabriel Alvin**
📚 Projeto acadêmico — Segurança da Informação e Criptografia Aplicada  
💡 Frameworks: FastAPI + React + Joy UI
