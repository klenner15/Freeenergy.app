import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Star, MapPin, ArrowLeft, Clock, Heart, Share2 } from 'lucide-react';
import MobileNavbar from '@/components/layout/mobile-navbar';
import MobileBottomNav from '@/components/layout/mobile-bottom-nav';
import ProductListItem from '@/components/store/product-list-item';
import { useAuth } from '@/hooks/use-auth';

const StoreDetailPage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Fetch store details
  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: [`/api/stores/${storeId}`],
  });
  
  // Fetch store products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: [`/api/stores/${storeId}/products`],
  });
  
  // Fetch cart items count
  const { data: cartItems = [] } = useQuery({
    queryKey: ['/api/cart'],
    enabled: !!user,
  });
  
  const goBack = () => {
    setLocation('/');
  };
  
  const handleCartClick = () => {
    setLocation('/cart');
  };
  
  // Filter products by selected category
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);
  
  // Extract unique product categories
  const categories = ['all', ...new Set(products.map(product => product.category))];
  
  if (storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-neutral-800">Loja não encontrada</h2>
          <p className="text-neutral-500 mt-2">A loja que você está procurando não existe ou foi removida.</p>
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
    <div className="min-h-screen">
      <MobileNavbar 
        cartItemsCount={cartItems.length}
        onCartClick={handleCartClick}
      />
      
      <main className="pt-16 pb-20">
        <div className="relative">
          {store.coverUrl ? (
            <img 
              src={store.coverUrl} 
              alt={store.name} 
              className="w-full h-48 object-cover" 
            />
          ) : (
            <div className="w-full h-48 bg-neutral-200 flex items-center justify-center">
              <span className="text-neutral-500">Sem imagem</span>
            </div>
          )}
          
          <button 
            className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-md"
            onClick={goBack}
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h1 className="text-xl font-bold">{store.name}</h1>
              <div className="flex items-center text-sm text-neutral-500 mt-1">
                <div className="flex items-center mr-3">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="ml-1">{store.rating || '4.8'}</span>
                  <span className="ml-1 text-neutral-400">(324)</span>
                </div>
                <div className="flex items-center text-green-brand">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{store.deliveryTime || '15-25 min'}</span>
                </div>
              </div>
              <p className="text-sm text-neutral-500 mt-1 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{store.address}</span>
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="w-9 h-9 flex items-center justify-center rounded-full border border-neutral-200">
                <Heart className="h-5 w-5 text-neutral-500" />
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded-full border border-neutral-200">
                <Share2 className="h-5 w-5 text-neutral-500" />
              </button>
            </div>
          </div>

          <div className="my-4 pt-3 border-t border-neutral-100">
            <div className="flex items-center space-x-3 overflow-x-auto pb-2">
              {categories.map((category, index) => (
                <button 
                  key={index}
                  className={`${
                    selectedCategory === category 
                      ? 'bg-primary text-white' 
                      : 'bg-neutral-100 text-neutral-700'
                  } text-sm font-medium rounded-full px-4 py-1.5 whitespace-nowrap`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? 'Todos' : category}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-3">Mais Vendidos</h2>
            
            {productsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="space-y-3">
                {filteredProducts.map((product) => (
                  <ProductListItem key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                Nenhum produto encontrado nesta categoria.
              </div>
            )}
          </div>
        </div>
      </main>
      
      <MobileBottomNav />
    </div>
  );
};

export default StoreDetailPage;
