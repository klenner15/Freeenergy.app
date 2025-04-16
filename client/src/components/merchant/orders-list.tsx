import React from 'react';
import { Order } from '@shared/schema';
import { formatDate } from '@/lib/utils';

interface OrdersListProps {
  orders: Order[];
}

const OrdersList: React.FC<OrdersListProps> = ({ orders }) => {
  // Function to get appropriate status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="px-2 py-1 bg-green-brand/10 text-green-brand rounded text-xs font-medium">
            Entregue
          </span>
        );
      case 'delivering':
        return (
          <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded text-xs font-medium">
            Em entrega
          </span>
        );
      case 'preparing':
        return (
          <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-xs font-medium">
            Em preparação
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-1 bg-orange-500/10 text-orange-500 rounded text-xs font-medium">
            Pendente
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-neutral-200 text-neutral-700 rounded text-xs font-medium">
            {status}
          </span>
        );
    }
  };
  
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="border-b border-neutral-100 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium text-sm">Pedido #{order.id}</p>
              <p className="text-xs text-neutral-500">
                {formatDate(order.createdAt)}
              </p>
            </div>
            {getStatusBadge(order.status)}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm">Itens: {Math.floor(Math.random() * 5) + 1}</p>
            <p className="font-medium text-sm">
              R$ {order.total.toFixed(2).replace('.', ',')}
            </p>
          </div>
        </div>
      ))}
      
      {orders.length === 0 && (
        <div className="text-center py-4 text-neutral-500">
          Nenhum pedido recente.
        </div>
      )}
      
      <div className="text-center pt-2">
        <button className="text-secondary text-sm font-medium">
          Ver todos os pedidos
        </button>
      </div>
    </div>
  );
};

export default OrdersList;
