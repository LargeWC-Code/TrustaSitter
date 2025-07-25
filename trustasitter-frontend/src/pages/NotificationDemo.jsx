import React, { useState, useEffect } from 'react';
import NotificationManager from '../components/NotificationManager';
import { useNotifications } from '../hooks/useNotifications';

const NotificationDemo = () => {
  const { getRead, loading } = useNotifications();
  const [readNotifications, setReadNotifications] = useState([]);

  useEffect(() => {
    const loadReadNotifications = async () => {
      const notifications = await getRead();
      setReadNotifications(notifications);
    };

    loadReadNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎯 Demonstração de Persistência de Notificações
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Esta página demonstra como as notificações são persistidas no banco de dados PostgreSQL.
            Teste marcando notificações como lidas/não lidas e veja como o status é mantido entre sessões.
          </p>
        </div>

        <NotificationManager />

        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              📊 Histórico de Notificações Lidas
            </h3>
            
            {loading ? (
              <p className="text-gray-500">Carregando histórico...</p>
            ) : readNotifications.length > 0 ? (
              <div className="space-y-2">
                {readNotifications.map((notification, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded border">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium text-gray-700">
                          {notification.notification_type}
                        </span>
                        <span className="text-gray-500 ml-2">
                          ID: {notification.notification_id}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(notification.read_at).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Nenhuma notificação lida encontrada.</p>
            )}
          </div>
        </div>

        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">
              🧪 Como Testar
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-700">
              <li>Marque algumas notificações como "lidas"</li>
              <li>Recarregue a página (F5)</li>
              <li>Veja que o status foi mantido</li>
              <li>Abra em outro navegador/dispositivo</li>
              <li>Faça login e veja que o status persiste</li>
              <li>Teste marcar como "não lida" e veja a sincronização</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDemo; 