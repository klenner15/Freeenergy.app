import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, MapPin, CreditCard } from 'lucide-react';
import CartItem from '@/components/cart/cart-item';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

const CartPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Fetch cart items
  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['/api/cart'],
    enabled: !!user,
  });
  
  // Group items by store
  const itemsByStore = cartItems.reduce((acc: any, item: any) => {
    const storeId = item.product.storeId;
    if (!acc[storeId]) {
      acc[storeId] = {
        storeId,
        storeName: item.product.category, // In a real app, this would be store name
        items: []
      };
    }
    acc[storeId].items.push(item);
    return acc;
  }, {});
  
  // Calculate cart totals
  const subtotal = cartItems.reduce((sum: number, item: any) => {
    return sum + (item.product.price * item.quantity);
  }, 0);
  
  const deliveryFee = subtotal > 0 ? 5.99 : 0;
  const total = subtotal + deliveryFee;
  
  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (cartItems.length === 0) {
        throw new Error('Carrinho vazio');
      }
      
      if (!user?.address) {
        throw new Error('Endereço não configurado');
      }
      
      // We'll create one order per store in a real app
      // For simplicity, we'll just use the first store's items
      const storeId = Object.values(itemsByStore)[0].storeId;
      
      const orderData = {
        storeId,
        status: 'pending',
        subtotal,
        deliveryFee,
        total,
        address: user.address,
        addressDetails: user.addressDetails || '',
        paymentMethod: 'credit_card',
        paymentDetails: '**** **** **** 4587'
      };
      
      const res = await apiRequest('POST', '/api/orders', orderData);
      return await res.json();
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: 'Pedido realizado com sucesso!',
        description: `Seu pedido #${order.id} foi confirmado.`,
      });
      setLocation(`/order/${order.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao finalizar pedido',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const handleCheckout = () => {
    createOrderMutation.mutate();
  };
  
  const goBack = () => {
    setLocation('/');
  };
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-neutral-800">Faça login para ver seu carrinho</h2>
          <p className="text-neutral-500 mt-2">Você precisa estar logado para acessar o carrinho.</p>
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
        <h1 className="text-lg font-semibold">Meu Carrinho</h1>
      </div>
      
      <div className="p-4 pb-24">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : cartItems.length > 0 ? (
          <>
            {Object.values(itemsByStore).map((storeGroup: any) => (
              <div key={storeGroup.storeId} className="bg-white rounded-lg shadow-sm p-3 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center mr-2">
                      <span className="font-medium text-xs">{storeGroup.storeName.substring(0, 1)}</span>
                    </div>
                    <h3 className="font-medium">{storeGroup.storeName}</h3>
                  </div>
                  <div className="text-xs flex items-center text-green-brand">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>15-25 min</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {storeGroup.items.map((item: any) => (
                    <CartItem 
                      key={item.id}
                      id={item.id}
                      name={item.product.name}
                      price={item.product.price}
                      quantity={item.quantity}
                      imageUrl={item.product.imageUrl}
                    />
                  ))}
                </div>
              </div>
            ))}
            
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <h3 className="font-semibold mb-3">Endereço de Entrega</h3>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-neutral-400 mt-0.5 mr-2" />
                <div>
                  <p className="font-medium text-sm">{user.address || 'Nenhum endereço cadastrado'}</p>
                  {user.addressDetails && (
                    <p className="text-neutral-500 text-sm">{user.addressDetails}</p>
                  )}
                  <button className="text-secondary text-sm font-medium mt-1">Alterar</button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <h3 className="font-semibold mb-3">Forma de Pagamento</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center mr-3">
                    <CreditCard className="h-5 w-5 text-neutral-700" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Cartão de Crédito</p>
                    <p className="text-neutral-500 text-xs">**** **** **** 4587</p>
                  </div>
                </div>
                <button className="text-secondary text-sm font-medium">Alterar</button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="border-b border-neutral-100 pb-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-500">Subtotal</span>
                  <span className="font-medium">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-neutral-500">Taxa de entrega</span>
                  <span className="font-medium">R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
              <div className="flex justify-between items-center font-semibold mt-3">
                <span>Total</span>
                <span className="text-primary">R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2">Seu carrinho está vazio</h2>
            <p className="text-neutral-500 mb-4">Adicione produtos de lojas próximas para continuar.</p>
            <button 
              className="bg-primary text-white font-medium text-sm rounded-lg px-6 py-2"
              onClick={goBack}
            >
              Explorar lojas
            </button>
          </div>
        )}
      </div>
      
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white px-4 py-3 shadow-lg border-t border-neutral-100">
          <button 
            className="w-full bg-primary text-white font-semibold py-3 rounded-lg shadow-sm"
            onClick={handleCheckout}
            disabled={createOrderMutation.isPending}
          >
            {createOrderMutation.isPending 
              ? 'Processando...' 
              : `Finalizar Pedido • R$ ${total.toFixed(2).replace('.', ',')}`
            }
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPage;
