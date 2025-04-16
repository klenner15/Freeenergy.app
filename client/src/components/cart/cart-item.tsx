import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface CartItemProps {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

const CartItem: React.FC<CartItemProps> = ({ id, name, price, quantity, imageUrl }) => {
  const { toast } = useToast();
  
  const updateQuantityMutation = useMutation({
    mutationFn: async (newQuantity: number) => {
      const res = await apiRequest("PUT", `/api/cart/${id}`, { quantity: newQuantity });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar quantidade",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const removeItemMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item removido",
        description: `${name} foi removido do carrinho.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover item",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const increaseQuantity = () => {
    updateQuantityMutation.mutate(quantity + 1);
  };
  
  const decreaseQuantity = () => {
    if (quantity === 1) {
      removeItemMutation.mutate();
    } else {
      updateQuantityMutation.mutate(quantity - 1);
    }
  };
  
  return (
    <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
      <div className="flex items-center">
        <div className="flex-none w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden mr-3">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={name} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
              <span className="text-neutral-500 text-xs">Sem imagem</span>
            </div>
          )}
        </div>
        <div>
          <h4 className="font-medium text-sm">{name}</h4>
          <p className="text-primary font-semibold text-sm">
            R$ {price.toFixed(2).replace('.', ',')}
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <button 
          className="w-7 h-7 bg-neutral-100 rounded-full flex items-center justify-center"
          onClick={decreaseQuantity}
          disabled={updateQuantityMutation.isPending || removeItemMutation.isPending}
          aria-label="Diminuir quantidade"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="mx-3 font-medium text-sm">{quantity}</span>
        <button 
          className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white"
          onClick={increaseQuantity}
          disabled={updateQuantityMutation.isPending}
          aria-label="Aumentar quantidade"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
