import React, { useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Phone } from 'lucide-react';
import OrderStatus from '@/components/tracking/order-status';
import { useAuth } from '@/hooks/use-auth';
import { formatDate } from '@/lib/utils';

const TrackingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  // Fetch order details
  const { data: order, isLoading, error } = useQuery({
    queryKey: [`/api/orders/${orderId}`],
    enabled: !!user && !!orderId,
    refetchInterval: 10000, // Refetch every 10 seconds to get updates
  });
  
  // Setup WebSocket connection for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log('WebSocket connection established');
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // If we receive an update for this order, refetch
        if (data.type === 'order_status_updated' && data.orderId === parseInt(orderId)) {
          // Manually invalidate the query to refetch
          window.location.reload();
        }
      } catch (e) {
        console.error('Error parsing WebSocket message:', e);
      }
    };
    
    return () => {
      socket.close();
    };
  }, [orderId]);
  
  const goBack = () => {
    setLocation('/');
  };
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-neutral-800">Faça login para ver seu pedido</h2>
          <p className="text-neutral-500 mt-2">Você precisa estar logado para acompanhar pedidos.</p>
          <button 
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
            onClick={() => setLocation('/auth')}
          >
            Fazer login
          </button>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-neutral-800">Pedido não encontrado</h2>
          <p className="text-neutral-500 mt-2">O pedido que você está procurando não existe ou foi removido.</p>
          <button 
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
            onClick={goBack}
          >
            Voltar para a página inicial
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-3 border-b border-neutral-100 flex items-center bg-white">
        <button 
          className="mr-3"
          onClick={goBack}
          aria-label="Voltar"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold">Acompanhar Pedido</h1>
      </div>
      
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="px-2 py-1 bg-green-brand/10 text-green-brand rounded text-xs font-medium">
              {order.status === 'delivered' ? 'Entregue' : 
               order.status === 'delivering' ? 'Em entrega' :
               order.status === 'preparing' ? 'Em preparação' :
               order.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
            </span>
            <span className="text-sm text-neutral-500">Pedido #{order.id}</span>
          </div>
          
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center mr-3">
              <span className="font-medium text-xs">S</span>
            </div>
            <div>
              <h3 className="font-medium">Loja #{order.storeId}</h3>
              <p className="text-xs text-neutral-500">{order.address}</p>
            </div>
          </div>
          
          <div className="border-t border-b border-neutral-100 py-3 my-3">
            <h4 className="font-medium text-sm mb-2">Status do pedido</h4>
            <OrderStatus 
              status={order.status} 
              statusHistory={order.statusHistory || []}
            />
          </div>
          
          <div>
            <h4 className="font-medium text-sm mb-3">Produtos do Pedido</h4>
            <div className="space-y-3">
              {order.items && order.items.length > 0 ? (
                order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-sm mr-2">{item.quantity}x</span>
                      <span className="text-sm">{item.product ? item.product.name : `Produto #${item.productId}`}</span>
                    </div>
                    <span className="text-sm">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-2 text-neutral-500">
                  Detalhes dos itens não disponíveis.
                </div>
              )}
            </div>
            
            <div className="border-t border-neutral-100 mt-3 pt-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500">Subtotal</span>
                <span>R$ {order.subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-neutral-500">Taxa de entrega</span>
                <span>R$ {order.deliveryFee.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between items-center font-semibold mt-2">
                <span>Total</span>
                <span className="text-primary">R$ {order.total.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
          <div className="h-48 bg-neutral-100" id="orderMap">
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-neutral-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p className="mt-2 text-neutral-500 text-sm">Mapa carregando...</p>
              </div>
            </div>
          </div>
          
          {order.deliveryPersonId && (
            <div className="p-4 border-t border-neutral-100">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center">
                  <span className="font-medium">E</span>
                </div>
                <div className="ml-3">
                  <h4 className="font-medium">Entregador #{order.deliveryPersonId}</h4>
                  <p className="text-xs text-neutral-500">Entregador</p>
                </div>
                <button className="ml-auto w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                  <Phone className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="text-center mb-4">
          <button className="bg-white border border-neutral-200 text-neutral-900 font-medium rounded-lg py-3 px-6 inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Preciso de ajuda
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;
