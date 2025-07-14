# Guia de Desenvolvimento - TrustaSitter

## 🚀 Configuração do Ambiente

### Pré-requisitos
- Node.js 18+
- PostgreSQL
- Git

### Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd TrustaSitter
```

2. **Instale as dependências**
```bash
# Instalar dependências do projeto principal
npm install

# Instalar dependências do backend
cd trustasitter-backend
npm install

# Instalar dependências do frontend
cd ../trustasitter-frontend
npm install
```

## 🔧 Desenvolvimento Local

### Opção 1: Executar tudo de uma vez
```bash
# Na raiz do projeto
npm run dev
```

### Opção 2: Executar separadamente
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

### URLs de Desenvolvimento
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **API Health Check**: http://localhost:3000/api/health

## 🌐 Ambiente de Produção

O sistema detecta automaticamente o ambiente:
- **Localhost**: Usa API local (http://localhost:3000/api)
- **Produção**: Usa API da Azure (https://trustasitter-api-cwahftcwg4e5axah.australiaeast-01.azurewebsites.net/api)

### Indicador Visual
- Em desenvolvimento: Mostra um badge amarelo no canto inferior direito
- Em produção: Não mostra o badge

## 🧪 Testes

### Testar Conexão com Banco
```bash
npm run test:db
```

### Testar API Local
```bash
# Health check
curl http://localhost:3000/api/health

# Login test
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bruno.silva@test.com","password":"senha123"}'
```

## 📦 Deploy

### 1. Teste Localmente
```bash
# Certifique-se de que tudo funciona localmente
npm run dev
# Teste o login e outras funcionalidades
```

### 2. Build para Produção
```bash
npm run build
```

### 3. Commit e Push
```bash
git add .
git commit -m "feat: description of changes"
git push origin main
```

### 4. Deploy Automático
O GitHub Actions irá automaticamente:
- Fazer build do frontend
- Deploy para Azure Static Web Apps
- Deploy do backend para Azure App Service

## 🔍 Debug

### Logs do Backend
- Local: Veja o terminal onde o backend está rodando
- Azure: Portal Azure > App Service > Log Stream

### Logs do Frontend
- Abra o DevTools do navegador (F12)
- Veja a aba Console para logs de ambiente e API

### Problemas Comuns

1. **Erro 500 no Login**
   - Verifique se o backend está rodando
   - Confirme se as variáveis de ambiente estão configuradas
   - Teste a conexão com o banco: `npm run test:db`

2. **CORS Error**
   - O CORS está configurado para aceitar localhost e domínios da Azure
   - Se estiver usando outro domínio, adicione no backend

3. **Banco de Dados**
   - Verifique se o PostgreSQL está rodando
   - Confirme se as credenciais estão corretas
   - Teste com: `npm run test:db`

## 📝 Estrutura do Projeto

```
TrustaSitter/
├── trustasitter-backend/     # API Node.js + Express
├── trustasitter-frontend/    # React App
├── package.json             # Scripts de desenvolvimento
├── DEVELOPMENT.md           # Este arquivo
└── README.md               # Documentação principal
```

## 🎯 Workflow Recomendado

1. **Desenvolvimento**: Use `npm run dev` para desenvolvimento local
2. **Teste**: Teste todas as funcionalidades localmente
3. **Commit**: Faça commit apenas quando tudo estiver funcionando
4. **Deploy**: Push para main dispara deploy automático
5. **Verificação**: Teste na produção após deploy

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs do backend
2. Teste a conexão com o banco
3. Confirme se as variáveis de ambiente estão corretas
4. Verifique se o CORS está configurado adequadamente 