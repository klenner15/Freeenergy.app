import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import MobileNavbar from '@/components/layout/mobile-navbar';
import MobileBottomNav from '@/components/layout/mobile-bottom-nav';
import CategoryCard from '@/components/home/category-card';
import StoreCard from '@/components/home/store-card';
import ProductCard from '@/components/home/product-card';
import { useAuth } from '@/hooks/use-auth';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  // Fetch nearby stores
  const { data: stores = [] } = useQuery({
    queryKey: ['/api/stores'],
  });
  
  // Fetch featured products
  const { data: featuredProducts = [] } = useQuery({
    queryKey: ['/api/products/featured'],
  });
  
  // Fetch cart items count
  const { data: cartItems = [] } = useQuery({
    queryKey: ['/api/cart'],
    enabled: !!user,
  });
  
  const handleSearchClick = () => {
    setLocation('/search');
  };
  
  const handleCartClick = () => {
    setLocation('/cart');
  };
  
  return (
    <div className="min-h-screen">
      <MobileNavbar 
        cartItemsCount={cartItems.length}
        onSearchClick={handleSearchClick}
        onCartClick={handleCartClick}
      />
      
      <main className="pt-20 pb-20">
        <div className="px-4 py-3">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-primary to-primary/90 rounded-xl p-4 text-white mb-6">
            <h1 className="text-xl font-bold mb-1">Compre de perto e receba logo!</h1>
            <p className="text-sm opacity-90 mb-4">
              Transforme seu bairro num shopping virtual. Compre, receba e apoie o comércio local!
            </p>
            <button 
              className="bg-white text-primary font-medium text-sm rounded-full px-4 py-2 shadow-sm"
              onClick={() => setLocation('/search')}
            >
              Explorar agora
            </button>
          </div>
          
          {/* Categories Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Categorias</h2>
              <a href="#" className="text-secondary text-sm font-medium">Ver todas</a>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              {categories.map((category) => (
                <CategoryCard 
                  key={category.id}
                  id={category.id}
                  name={category.name}
                  icon={category.icon}
                  color={category.color}
                />
              ))}
            </div>
          </div>
          
          {/* Nearby Stores Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Lojas Próximas</h2>
              <a href="#" className="text-secondary text-sm font-medium">Ver todas</a>
            </div>
            
            <div className="space-y-4">
              {stores.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
              
              {stores.length === 0 && (
                <div className="text-center py-4 text-neutral-500">
                  Nenhuma loja encontrada na sua região.
                </div>
              )}
            </div>
          </div>
          
          {/* Featured Products Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Produtos em Destaque</h2>
              <a href="#" className="text-secondary text-sm font-medium">Ver todos</a>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
              
              {featuredProducts.length === 0 && (
                <div className="col-span-2 text-center py-4 text-neutral-500">
                  Nenhum produto em destaque no momento.
                </div>
              )}
            </div>
          </div>
          
          {/* Sustainability Section */}
          <div className="mb-6 bg-gradient-to-r from-green-brand/90 to-green-brand rounded-lg p-4 text-white">
            <div className="flex items-start">
              <div className="mr-3 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Apoie o Comércio Sustentável</h3>
                <p className="text-sm opacity-90 mb-2">
                  Ao comprar produtos locais, você reduz a emissão de carbono e fortalece sua comunidade.
                </p>
                <button className="bg-white text-green-brand font-medium text-xs rounded-full px-3 py-1.5">
                  Conheça nossas iniciativas
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <MobileBottomNav />
    </div>
  );
};

export default HomePage;
