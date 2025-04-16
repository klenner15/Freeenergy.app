import React from 'react';
import { Link } from 'wouter';
import { Plus, Star } from 'lucide-react';
import { Product } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, compact = false }) => {
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

  if (compact) {
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
            <p className="font-semibold text-primary">R$ {Number.isNaN(parseFloat(product.price)) ? '0.00' : parseFloat(product.price).toFixed(2).replace('.', ',')}</p>
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
  }

  return (
    <Link href={`/product/${product.id}`} className="block bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="relative">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-32 object-cover" 
            />
          ) : (
            <div className="w-full h-32 bg-neutral-200 flex items-center justify-center">
              <span className="text-neutral-500">Sem imagem</span>
            </div>
          )}

          <button 
            className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-sm"
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending}
            aria-label="Adicionar ao carrinho"
          >
            <Plus className="h-5 w-5 text-primary" />
          </button>
        </div>

        <div className="p-2">
          <p className="text-xs text-neutral-500">{product.category}</p>
          <h3 className="font-medium text-sm">{product.name}</h3>
          <div className="mt-1 flex justify-between items-center">
            <p className="font-semibold text-primary">R$ {Number.isNaN(parseFloat(product.price)) ? '0.00' : parseFloat(product.price).toFixed(2).replace('.', ',')}</p>
            {product.rating && (
              <div className="flex items-center text-xs text-neutral-500">
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                <span className="ml-1">{product.rating}</span>
              </div>
            )}
          </div>
        </div>
    </Link>
  );
};

export default ProductCard;