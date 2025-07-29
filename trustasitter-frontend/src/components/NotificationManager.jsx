import React, { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';

const NotificationManager = () => {
  const { 
    markAsRead, 
    markAsUnread, 
    getStatus, 
    isRead, 
    getReadAt, 
    loading, 
    error 
  } = useNotifications();

  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Nova reserva confirmada', content: 'Sua reserva com Maria foi confirmada para amanhã.' },
    { id: '2', title: 'Mensagem recebida', content: 'João enviou uma mensagem sobre a reserva.' },
    { id: '3', title: 'Pagamento processado', content: 'O pagamento da sua reserva foi processado com sucesso.' },
    { id: '4', title: 'Avaliação pendente', content: 'Não esqueça de avaliar o serviço da Ana.' }
  ]);

  const notificationType = 'booking_notifications';

  // Load notification status on component mount
  useEffect(() => {
    const loadNotificationStatus = async () => {
      const notificationIds = notifications.map(n => n.id);
      await getStatus(notificationType, notificationIds);
    };

    loadNotificationStatus();
  }, []);

  const handleToggleRead = async (notificationId) => {
    const currentlyRead = isRead(notificationId);
    
    if (currentlyRead) {
      await markAsUnread(notificationType, notificationId);
    } else {
      await markAsRead(notificationType, notificationId);
    }
  };

  const handleMarkAllAsRead = async () => {
    for (const notification of notifications) {
      if (!isRead(notification.id)) {
        await markAsRead(notificationType, notification.id);
      }
    }
  };

  const handleMarkAllAsUnread = async () => {
    for (const notification of notifications) {
      if (isRead(notification.id)) {
        await markAsUnread(notificationType, notification.id);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Gerenciador de Notificações
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleMarkAllAsRead}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Processando...' : 'Marcar todas como lidas'}
            </button>
            <button
              onClick={handleMarkAllAsUnread}
              disabled={loading}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
            >
              {loading ? 'Processando...' : 'Marcar todas como não lidas'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            Erro: {error}
          </div>
        )}

        <div className="space-y-4">
          {notifications.map((notification) => {
            const read = isRead(notification.id);
            const readAt = getReadAt(notification.id);

            return (
              <div
                key={notification.id}
                className={`p-4 border rounded-lg transition-all duration-200 ${
                  read 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-blue-50 border-blue-200 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`font-semibold ${
                        read ? 'text-gray-600' : 'text-blue-800'
                      }`}>
                        {notification.title}
                      </h3>
                      {!read && (
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <p className={`text-sm ${
                      read ? 'text-gray-500' : 'text-gray-700'
                    }`}>
                      {notification.content}
                    </p>
                    {read && readAt && (
                      <p className="text-xs text-gray-400 mt-2">
                        Lida em: {formatDate(readAt)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleToggleRead(notification.id)}
                    disabled={loading}
                    className={`ml-4 px-3 py-1 text-xs rounded transition-colors ${
                      read
                        ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        : 'bg-blue-200 text-blue-700 hover:bg-blue-300'
                    } disabled:opacity-50`}
                  >
                    {loading ? '...' : (read ? 'Marcar como não lida' : 'Marcar como lida')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2">Informações sobre Persistência:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• ✅ Status salvo no banco de dados PostgreSQL</li>
            <li>• ✅ Funciona em qualquer dispositivo/navegador</li>
            <li>• ✅ Não perde ao limpar cache do navegador</li>
            <li>• ✅ Sincronizado com o backend em tempo real</li>
            <li>• ✅ Histórico de quando foi marcada como lida</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotificationManager; 