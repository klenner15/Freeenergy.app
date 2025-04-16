import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  DollarSign, 
  ShoppingBag, 
  UserPlus, 
  Zap,
  Bell,
  MoreVertical,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import MerchantSidebar from '@/components/layout/merchant-sidebar';
import StatsCard from '@/components/merchant/stats-card';
import OrdersList from '@/components/merchant/orders-list';
import ProductsTable from '@/components/merchant/products-table';

const MerchantDashboardPage: React.FC = () => {
  const { user, logoutMutation } = useAuth();
  
  // Fetch merchant stores
  const { data: stores = [] } = useQuery({
    queryKey: ['/api/stores'],
    enabled: !!user,
  });
  
  // Fetch orders for merchant
  const { data: orders = [] } = useQuery({
    queryKey: ['/api/orders'],
    enabled: !!user,
  });
  
  // Fetch products for merchant's first store
  const storeId = stores.length > 0 ? stores[0].id : null;
  
  const { data: products = [] } = useQuery({
    queryKey: [`/api/stores/${storeId}/products`],
    enabled: !!storeId,
  });
  
  // Mock data for stats cards
  const statsData = {
    todaySales: 'R$ 1.590,00',
    todaySalesChange: '15% vs. ontem',
    todayOrders: '24',
    todayOrdersChange: '8% vs. ontem',
    newCustomers: '7',
    newCustomersChange: '12% vs. média',
    energySavings: 'R$ 320,00',
    energySavingsChange: '28% vs. mês anterior'
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <MerchantSidebar />
      
      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button className="text-neutral-500 relative">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">3</span>
              </button>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
                  <span className="font-medium text-xs">{user?.name?.charAt(0) || 'U'}</span>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-sm">{user?.name || 'Usuário'}</p>
                  <p className="text-xs text-neutral-500">Comerciante</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatsCard 
              title="Vendas hoje"
              value={statsData.todaySales}
              change={statsData.todaySalesChange}
              icon={<DollarSign className="h-5 w-5" />}
              iconBgColor="rgba(255, 107, 0, 0.1)"
              iconColor="#FF6B00"
            />
            
            <StatsCard 
              title="Pedidos hoje"
              value={statsData.todayOrders}
              change={statsData.todayOrdersChange}
              icon={<ShoppingBag className="h-5 w-5" />}
              iconBgColor="rgba(0, 105, 255, 0.1)"
              iconColor="#0069FF"
            />
            
            <StatsCard 
              title="Novos clientes"
              value={statsData.newCustomers}
              change={statsData.newCustomersChange}
              icon={<UserPlus className="h-5 w-5" />}
              iconBgColor="rgba(22, 163, 74, 0.1)"
              iconColor="#16A34A"
            />
            
            <StatsCard 
              title="Economia de energia"
              value={statsData.energySavings}
              change={statsData.energySavingsChange}
              icon={<Zap className="h-5 w-5" />}
              iconBgColor="rgba(245, 158, 11, 0.1)"
              iconColor="#F59E0B"
            />
          </div>
          
          {/* Orders and Sales Graph Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold">Vendas nos últimos 7 dias</h3>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full">Diário</button>
                  <button className="px-3 py-1 text-sm text-neutral-500 rounded-full">Semanal</button>
                  <button className="px-3 py-1 text-sm text-neutral-500 rounded-full">Mensal</button>
                </div>
              </div>
              <div className="h-64 bg-neutral-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-neutral-300 mx-auto" />
                  <p className="mt-2 text-neutral-500 text-sm">Gráfico de vendas seria exibido aqui</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-6">Pedidos recentes</h3>
              <OrdersList orders={orders.slice(0, 3)} />
            </div>
          </div>
          
          {/* Products Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold">Produtos populares</h3>
              <button className="text-secondary text-sm font-medium">Gerenciar produtos</button>
            </div>
            
            <ProductsTable products={products.slice(0, 5)} />
          </div>
          
          {/* Customer Location Map */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-100">
              <h3 className="font-semibold">Mapa de clientes</h3>
              <p className="text-sm text-neutral-500 mt-1">Visualize onde seus clientes estão localizados</p>
            </div>
            <div className="h-80 bg-neutral-50" id="customerMap">
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-neutral-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p className="mt-2 text-neutral-500 text-sm">Mapa carregando...</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MerchantDashboardPage;
