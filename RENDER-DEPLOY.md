# Deploy no Render - Guia Completo

## Estrutura do Projeto
```
projeto/
├── index.html          (frontend)
├── app.js              (frontend)
├── styles.css          (frontend)
├── backend/
│   ├── server.js       (backend)
│   ├── package.json    (backend)
│   ├── copy-static.js  (script de build)
│   └── database/       (banco SQLite)
└── render.yaml         (configuração Render)
```

## Como Funciona

1. **Build Command**: Instala dependências e copia arquivos estáticos para `backend/`
2. **Start Command**: Executa `npm start` que roda `server.js`
3. **Server**: Serve API em `/api/*` e arquivos estáticos em outras rotas

## Configuração no Render

### Opção 1: Usando render.yaml (Recomendado)

O arquivo `render.yaml` já está configurado. Basta:

1. No Render Dashboard, vá em **New** → **Blueprint**
2. Conecte seu repositório
3. O Render detectará automaticamente o `render.yaml`

### Opção 2: Configuração Manual

No painel do Render, configure:

**Root Directory:**
```
backend
```

**Build Command:**
```
npm install
```
(O script `postinstall` em package.json já copia os arquivos automaticamente)

**Start Command:**
```
npm start
```

**Environment Variables:**
- `NODE_ENV` = `production`

## O que acontece no Build

1. `npm install` instala as dependências
2. `postinstall` executa `copy-static.js` que copia:
   - `index.html` → `backend/index.html`
   - `app.js` → `backend/app.js`
   - `styles.css` → `backend/styles.css`

## Verificação

Após o deploy, acesse:
- Frontend: `https://seu-app.onrender.com`
- API: `https://seu-app.onrender.com/api/users`
- Health: `https://seu-app.onrender.com/health`

## Troubleshooting

### Erro 404 nos arquivos estáticos
- Verifique se o build copiou os arquivos (veja logs do build)
- Confirme que `Root Directory` está como `backend`

### Erro ao iniciar servidor
- Verifique se `PORT` está sendo usado (Render define automaticamente)
- Confirme que `NODE_ENV=production` está configurado

### Banco de dados não funciona
- SQLite precisa de permissões de escrita
- O arquivo `users.db` será criado automaticamente em `backend/database/`

