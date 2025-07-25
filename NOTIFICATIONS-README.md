# 🎯 Sistema de Persistência de Notificações - TrustaSitter

## 📋 Visão Geral

Este sistema implementa persistência de notificações no backend usando PostgreSQL, permitindo que o status "lido/não lido" seja mantido entre sessões, dispositivos e navegadores.

## 🏗️ Arquitetura

### Backend (Node.js + Express + PostgreSQL)

#### 1. Tabela `notifications_read`
```sql
CREATE TABLE notifications_read (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    notification_id VARCHAR(100) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, notification_type, notification_id)
);
```

#### 2. Endpoints da API
- `POST /api/notifications/read` - Marcar como lida
- `POST /api/notifications/unread` - Marcar como não lida
- `GET /api/notifications/status` - Obter status de múltiplas notificações
- `GET /api/notifications/read` - Listar notificações lidas

### Frontend (React)

#### 1. Hook `useNotifications`
- Gerencia estado das notificações
- Sincroniza com o backend
- Fornece métodos para marcar como lida/não lida

#### 2. Componente `NotificationManager`
- Interface de usuário para gerenciar notificações
- Demonstra a funcionalidade de persistência

## 🚀 Como Usar

### 1. Configuração do Banco de Dados

Execute o script para criar a tabela:
```bash
cd trustaSitter-backend
node setup-notifications-table.js
```

### 2. Testando a Funcionalidade

Acesse a página de demonstração:
```
http://localhost:5173/notification-demo
```

### 3. Integração em Outros Componentes

```jsx
import { useNotifications } from '../hooks/useNotifications';

const MyComponent = () => {
  const { markAsRead, isRead, getStatus } = useNotifications();
  
  // Marcar como lida
  const handleMarkAsRead = async (notificationId) => {
    await markAsRead('booking_notifications', notificationId);
  };
  
  // Verificar se está lida
  const isNotificationRead = isRead(notificationId);
  
  return (
    <div>
      {isNotificationRead ? '✅ Lida' : '🔵 Não lida'}
      <button onClick={() => handleMarkAsRead(notificationId)}>
        Marcar como lida
      </button>
    </div>
  );
};
```

## 📊 Funcionalidades

### ✅ Persistência Completa
- Status salvo no banco PostgreSQL
- Funciona em qualquer dispositivo/navegador
- Não perde ao limpar cache
- Sincronizado em tempo real

### ✅ Histórico Detalhado
- Timestamp de quando foi marcada como lida
- Rastreamento de múltiplos tipos de notificação
- Consulta de histórico completo

### ✅ Performance Otimizada
- Índices no banco para consultas rápidas
- Cache local no frontend
- Consultas em lote para múltiplas notificações

## 🔧 Configuração

### Variáveis de Ambiente
```env
# Backend (já configurado)
DB_HOST=20.40.73.193
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=LargeWC<123456>
DB_NAME=postgres
```

### Dependências
```json
{
  "pg": "^8.16.2",
  "express": "^5.1.0",
  "jsonwebtoken": "^9.0.2"
}
```

## 🧪 Testes

### Cenários de Teste
1. **Persistência entre sessões**
   - Marcar como lida → Recarregar página → Status mantido

2. **Persistência entre dispositivos**
   - Marcar como lida no PC → Abrir no celular → Status sincronizado

3. **Persistência entre navegadores**
   - Marcar como lida no Chrome → Abrir no Firefox → Status mantido

4. **Limpeza de cache**
   - Marcar como lida → Limpar cache → Status preservado

## 📁 Estrutura de Arquivos

```
trustaSitter-backend/
├── create-notifications-table.sql    # Script SQL
├── setup-notifications-table.js      # Script de setup
└── index.js                          # Endpoints da API

trustasitter-frontend/
├── src/
│   ├── hooks/
│   │   └── useNotifications.js       # Hook personalizado
│   ├── components/
│   │   └── NotificationManager.jsx   # Componente de exemplo
│   ├── pages/
│   │   └── NotificationDemo.jsx      # Página de demonstração
│   └── services/
│       └── api.js                    # Funções da API
```

## 🎯 Benefícios

1. **Experiência do Usuário**
   - Não perde status ao trocar de dispositivo
   - Interface consistente entre sessões
   - Feedback visual claro

2. **Profissionalismo**
   - Funcionalidade de nível enterprise
   - Persistência robusta
   - Escalável para produção

3. **Manutenibilidade**
   - Código bem estruturado
   - Hook reutilizável
   - Documentação completa

## 🔮 Próximos Passos

- [ ] Adicionar notificações em tempo real (WebSocket)
- [ ] Implementar notificações push
- [ ] Adicionar filtros e busca
- [ ] Criar dashboard de analytics
- [ ] Implementar notificações por email

---

**Desenvolvido para o projeto TrustaSitter**  
*Sistema de reservas de babás com persistência profissional* 