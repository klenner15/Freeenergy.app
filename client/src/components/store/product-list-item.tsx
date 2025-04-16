import React from 'react';
import { Plus } from 'lucide-react';
import { Product } from '@shared/schema';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface ProductListItemProps {
  product: Product;
}

const ProductListItem: React.FC<ProductListItemProps> = ({ product }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity: 1,
        userId: user?.id
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Produto adicionado",
        description: `${product.name} foi adicionado ao carrinho!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao adicionar produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para adicionar produtos ao carrinho.",
        variant: "destructive",
      });
      return;
    }
    
    addToCartMutation.mutate();
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-3 flex">
      {product.imageUrl ? (
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-20 h-20 rounded-lg object-cover" 
        />
      ) : (
        <div className="w-20 h-20 bg-neutral-200 rounded-lg flex items-center justify-center">
          <span className="text-neutral-500 text-xs">Sem imagem</span>
        </div>
      )}
      
      <div className="ml-3 flex-1">
        <h3 className="font-medium">{product.name}</h3>
        <p className="text-xs text-neutral-500 mt-1">{product.description}</p>
        <div className="flex justify-between items-center mt-2">
          <p className="font-semibold text-primary">R$ {(typeof product.price === 'number' ? product.price.toFixed(2) : product.price).replace('.', ',')}</p>
          <button 
            className="bg-primary text-white rounded-full w-7 h-7 flex items-center justify-center shadow-sm"
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending}
            aria-label="Adicionar ao carrinho"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductListItem;
